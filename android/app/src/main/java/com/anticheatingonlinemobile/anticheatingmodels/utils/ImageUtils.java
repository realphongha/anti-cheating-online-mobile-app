package com.anticheatingonlinemobile.anticheatingmodels.utils;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.ImageFormat;
import android.graphics.Matrix;
import android.graphics.Paint;
import android.graphics.Rect;
import android.graphics.YuvImage;
import android.util.Base64;
import android.util.Log;

import androidx.camera.core.ImageProxy;

import java.io.ByteArrayOutputStream;
import java.nio.ByteBuffer;
import java.nio.FloatBuffer;
import java.util.List;

public class ImageUtils {

    public static FloatBuffer preProcess(Bitmap bitmap, int w, int h, boolean convertToBgr) {
        FloatBuffer imgData = FloatBuffer.allocate(3 * h * w);
        imgData.rewind();
        int stride = h * w;
        int[] bmpData = new int[stride];
        bitmap.getPixels(bmpData, 0, bitmap.getWidth(), 0, 0,
                bitmap.getWidth(), bitmap.getHeight());
        for (int i = 0; i < h; i++){
            for (int j = 0; j < w; j++){
                int idx = w * i + j;
                int pixelValue = bmpData[idx];
                if (convertToBgr) {
                    imgData.put(idx + stride * 2, (((pixelValue >> 16 & 0xFF) / 255f - 0.485f) / 0.229f));
                    imgData.put(idx + stride, (((pixelValue >> 8 & 0xFF) / 255f - 0.456f) / 0.224f));
                    imgData.put(idx, (((pixelValue & 0xFF) / 255f - 0.406f) / 0.225f));
                } else {
                    imgData.put(idx, (((pixelValue >> 16 & 0xFF) / 255f - 0.485f) / 0.229f));
                    imgData.put(idx + stride, (((pixelValue >> 8 & 0xFF) / 255f - 0.456f) / 0.224f));
                    imgData.put(idx + stride * 2, (((pixelValue & 0xFF) / 255f - 0.406f) / 0.225f));
                }
            }
        }
        imgData.rewind();
        return imgData;
    }

    public static Bitmap rotate(Bitmap bitmap, float degrees){
        Matrix matrix = new Matrix();
        matrix.postRotate(degrees);
        return Bitmap.createBitmap(bitmap, 0, 0, bitmap.getWidth(), bitmap.getHeight(),
                matrix, true);
    }

    public static Bitmap toBitmap(ImageProxy image) throws Exception {
        image.setCropRect(new Rect(0, 0, image.getWidth(), image.getHeight()));
        byte[] nv21 = yuv420888ToNv21(image);
        YuvImage yuvImage = new YuvImage(nv21, ImageFormat.NV21,
                    image.getWidth(), image.getHeight(), null);
        return toBitmap(yuvImage);
    }

    public static Bitmap toBitmap(YuvImage image) throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        if (!image.compressToJpeg(new Rect(0, 0, image.getWidth(), image.getHeight()), 100, out))
            throw new Exception("Cannot compress yuv image to jpg!");
        byte[] imageBytes = out.toByteArray();
        return BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.length);
    }

    public static byte[] yuv420888ToNv21(ImageProxy image) {
        int pixelCount = image.getCropRect().width() * image.getCropRect().height();
        Log.i("ReactNative", String.valueOf(image.getCropRect().width()) + " " +
                String.valueOf(image.getCropRect().height()));
        int pixelSizeBits = ImageFormat.getBitsPerPixel(ImageFormat.YUV_420_888);
        byte[] outputBuffer = new byte[pixelCount * pixelSizeBits / 8];
        imageToByteBuffer(image, outputBuffer, pixelCount);
        return outputBuffer;
    }

    public static void imageToByteBuffer(ImageProxy image, byte[] outputBuffer, int pixelCount) {
        assert(image.getFormat() == ImageFormat.YUV_420_888);

        Rect imageCrop = image.getCropRect();
        ImageProxy.PlaneProxy[] imagePlanes = image.getPlanes();

        for (int i = 0; i < imagePlanes.length; i++){
            int outputStride = -1;
            int outputOffset = -1;
            boolean breakFor = false;
            switch (i) {
                case 0:
                    outputStride = 1;
                    outputOffset = 0;
                    break;
                case 1:
                    outputStride = 2;
                    outputOffset = pixelCount + 1;
                    break;
                case 2:
                    outputStride = 2;
                    outputOffset = pixelCount;
                    break;
                default:
                    breakFor = true;
                    break;
            }
            if (breakFor){
                continue;
            }
            ImageProxy.PlaneProxy plane = imagePlanes[i];
            ByteBuffer planeBuffer = plane.getBuffer();
            int rowStride = plane.getRowStride();
            int pixelStride = plane.getPixelStride();
            Rect planeCrop;
            if (i == 0) {
                planeCrop = imageCrop;
            } else {
                planeCrop = new Rect(imageCrop.left / 2, imageCrop.top / 2,
                        imageCrop.right / 2, imageCrop.bottom / 2);
            }
            int planeWidth = planeCrop.width();
            int planeHeight = planeCrop.height();

            byte[] rowBuffer = new byte[plane.getRowStride()];
            int rowLength = ((pixelStride == 1 && outputStride == 1) ? planeWidth :
                    (planeWidth - 1) * pixelStride + 1);

            for (int row = 0; row < planeHeight; row++){
                planeBuffer.position((row + planeCrop.top) * rowStride +
                        planeCrop.left * pixelStride);
                if (pixelStride == 1 && outputStride == 1){
                    planeBuffer.get(outputBuffer, outputOffset, rowLength);
                    outputOffset += rowLength;
                } else {
                    planeBuffer.get(rowBuffer, 0, rowLength);
                    for (int col = 0; col < planeWidth; col++){
                        outputBuffer[outputOffset] = rowBuffer[col * pixelStride];
                        outputOffset += outputStride;
                    }
                }
            }
        }
    }

    public static void drawBoxes(List<float[]> boxes, Canvas canvas, String[] clsString) {
        for (float[] box: boxes) {
            int x0 = Math.round(box[0]);
            int y0 = Math.round(box[1]);
            int x1 = Math.round(box[2]);
            int y1 = Math.round(box[3]);
            int cls = Math.round(box[5]);
            Paint paint = new Paint();
            paint.setStyle(Paint.Style.STROKE);
            paint.setColor(Color.RED);
            paint.setAntiAlias(true);
            Rect rect = new Rect(x0, y0, x1, y1);
            canvas.drawRect(rect, paint);
            paint.setTextSize(20);
            paint.setStyle(Paint.Style.FILL);
            canvas.drawText(clsString[cls], x0, y0, paint);
        }
    }

    public static void drawPose(float[][] pose, Canvas canvas) {
        for (float[] point: pose) {
            Paint paint = new Paint();
            paint.setStyle(Paint.Style.FILL);
            paint.setColor(Color.RED);
            paint.setAntiAlias(true);
            canvas.drawCircle(point[0], point[1], 5, paint);
        }
    }

    public static String bitmapToBase64(Bitmap bitmap, int quality) {
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        bitmap.compress(Bitmap.CompressFormat.PNG, quality, byteArrayOutputStream);
        byte[] byteArray = byteArrayOutputStream.toByteArray();
        return Base64.encodeToString(byteArray, Base64.DEFAULT);
    }
}
