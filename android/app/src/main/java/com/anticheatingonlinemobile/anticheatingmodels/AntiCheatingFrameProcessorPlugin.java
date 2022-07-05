package com.anticheatingonlinemobile.anticheatingmodels;

import androidx.annotation.NonNull;
import androidx.camera.core.ImageProxy;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableNativeArray;
import com.mrousavy.camera.frameprocessor.FrameProcessorPlugin;
import com.anticheatingonlinemobile.anticheatingmodels.models.*;
import com.anticheatingonlinemobile.anticheatingmodels.utils.*;

import android.annotation.SuppressLint;
import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.ImageFormat;
import android.graphics.Paint;
import android.graphics.Rect;
import android.media.AudioManager;
import android.media.Image;
import android.os.SystemClock;
import android.util.Base64;
import android.util.Log;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.nio.FloatBuffer;
import java.util.Arrays;
import java.util.List;

import ai.onnxruntime.OnnxTensor;
import ai.onnxruntime.OnnxValue;
import ai.onnxruntime.OrtEnvironment;
import ai.onnxruntime.OrtException;
import ai.onnxruntime.OrtSession;
import ai.onnxruntime.OrtSession.Result;
import ai.onnxruntime.OrtSession.RunOptions;
import ai.onnxruntime.OrtSession.SessionOptions;

public class AntiCheatingFrameProcessorPlugin extends FrameProcessorPlugin {

    private final OrtEnvironment env = OrtEnvironment.getEnvironment();
    private OrtSession sessionObjDet = null;
    private OrtSession sessionPose = null;
    private OrtSession sessionAction = null;
    private NanoDet nanodetEngine = null;
    private UdpPose udpEngine = null;
    private FCNet fcnetEngine = null;
    private ReactApplicationContext context = null;
    private final int PERSON_PADDING = 5;

    AntiCheatingFrameProcessorPlugin(ReactApplicationContext context) {
        super("antiCheatingModels");
        Resources resources = context.getResources();
        this.context = context;
        Log.i("ReactNative", "init");
        try {
            InputStream objDetWeights = resources.getAssets().open(Constants.OBJ_DET_WEIGHTS);
            InputStream poseWeights = resources.getAssets().open(Constants.POSE_WEIGHTS);
            InputStream actionWeights = resources.getAssets().open(Constants.ACTION_WEIGHTS);
            sessionObjDet = env.createSession(Utils.inputStreamToByteArr(objDetWeights));
            sessionPose = env.createSession(Utils.inputStreamToByteArr(poseWeights));
            sessionAction = env.createSession(Utils.inputStreamToByteArr(actionWeights));
            Log.i("ReactNative", sessionObjDet.toString());
            Log.i("ReactNative", sessionPose.toString());
            Log.i("ReactNative", sessionAction.toString());
            nanodetEngine = new NanoDet(sessionObjDet, env);
            udpEngine = new UdpPose(sessionPose, env);
            fcnetEngine = new FCNet(sessionAction, env);
        } catch (OrtException e) {
            Log.e("ReactNative", "Can't create InferenceSession");
            Log.e("ReactNative", e.toString());
        } catch (IOException e) {
            Log.e("ReactNative", e.toString());
        }
    }

    @SuppressLint("UnsafeOptInUsageError")
    @Override
    public Object callback(@NonNull ImageProxy frame, @NonNull Object[] params) {
        boolean trackPerson = (boolean) params[0];
        boolean trackLaptop = (boolean) params[1];
        boolean trackKeyboard = (boolean) params[2];
        boolean trackMouse = (boolean) params[3];
        WritableNativeArray results = new WritableNativeArray();
        try {
            long t0 = SystemClock.uptimeMillis();
            Bitmap imgBitmap = ImageUtils.toBitmap(frame);
            Bitmap rawBitmap = Bitmap.createScaledBitmap(imgBitmap,
                    Constants.OBJ_DET_INPUT_W, Constants.OBJ_DET_INPUT_H, false);
            Bitmap bitmap = null;
            if (rawBitmap != null) {
                bitmap = ImageUtils.rotate(rawBitmap, (float) frame.getImageInfo().getRotationDegrees());
            } else {
                throw new Exception("Cannot resize bitmap!");
            }
            if (bitmap == null) {
                throw new Exception("Cannot rotate bitmap!");
            }
            List<float[]> boxes = nanodetEngine.run(bitmap, t0);
            int countPerson = 0;
            Log.i("ReactNative", "Detected " + String.valueOf(boxes.size()) + " boxes:");
            float[] personBox = null;
            for (float[] box: boxes){
                Log.i("ReactNative", Arrays.toString(box));
                int x0 = (int) Math.round(box[0]);
                int y0 = (int) Math.round(box[1]);
                int x1 = (int) Math.round(box[2]);
                int y1 = (int) Math.round(box[3]);
                int cls = (int) box[5];

                if (cls == Constants.PERSON_CLS){
                    countPerson = countPerson + 1;
                    if (trackPerson && countPerson > 1) break;
                    if (personBox == null) {
                        personBox = new float[]{x0, y0, x1, y1, box[4]};
                    } else if (box[4] > personBox[4]) {
                        personBox = new float[]{x0, y0, x1, y1, box[4]};
                    }
                }
            }
            if (trackPerson && countPerson > 1) {
                results.pushInt(Constants.CHEATING_PERSONS);
                results.pushString(ImageUtils.bitmapToBase64(bitmap, 100));
                results.pushInt(countPerson);
                return results;
            }
            if (personBox == null) {
                results.pushInt(Constants.CHEATING_PERSONS);
                results.pushString(ImageUtils.bitmapToBase64(bitmap, 100));
                results.pushInt(0);
                return results;
            }

            Bitmap cropBitmap = null;
            float newX0 = Math.max(personBox[0] - PERSON_PADDING, 0f);
            float newY0 = Math.max(personBox[1] - PERSON_PADDING, 0f);
            float newX1 = Math.min(personBox[2] + PERSON_PADDING, Constants.OBJ_DET_INPUT_W);
            float newY1 = Math.min(personBox[3] + PERSON_PADDING, Constants.OBJ_DET_INPUT_H);
            cropBitmap = Bitmap.createBitmap(bitmap,
                    (int) newX0, (int) newY0,
                    (int) (newX1 - newX0), (int) (newY1 - newY0));

            // pose:
            t0 = SystemClock.uptimeMillis();
            Bitmap personBitmap = Bitmap.createScaledBitmap(cropBitmap,
                    Constants.POSE_INPUT_W, Constants.POSE_INPUT_H,false);
            float[][] pose = udpEngine.run(personBitmap, t0);

            Log.i("ReactNative", "Pose:");
            for (float[] point: pose){
                Log.i("ReactNative", Arrays.toString(point));
            }

            int countUnconfidentPoints = 0;
            for (float[] point: pose){
                if (point[2] < Constants.MIN_CONF_SCORES) {
                    countUnconfidentPoints++;
                }
            }
            if (countUnconfidentPoints > Constants.MAX_UNCONFIDENT_POINTS) {
                results.pushInt(Constants.CHEATING_WRONG_POSE);
                results.pushString(ImageUtils.bitmapToBase64(bitmap, 100));
                results.pushInt(Constants.NOT_ENOUGH_VISIBLE_POINTS_CLS);
                return results;
            }

            // find hands' positions:
            float[] leftHand = {pose[9][0]+(pose[9][0]-pose[7][0])/3,
                                pose[9][1]+(pose[9][1]-pose[7][1])/3};
            float[] leftHand2 = {pose[9][0], pose[9][1]};
            float[] leftHand3 = {pose[9][0]+(pose[9][0]-pose[7][0])*2/3,
                                pose[9][1]+(pose[9][1]-pose[7][1])*2/3};
            float[] rightHand = {pose[10][0]+(pose[10][0]-pose[8][0])/3,
                                 pose[10][1]+(pose[10][1]-pose[8][1])/3};
            float[] rightHand2 = {pose[10][0], pose[10][1]};
            float[] rightHand3 = {pose[10][0]+(pose[10][0]-pose[8][0])*2/3,
                                 pose[10][1]+(pose[10][1]-pose[8][1])*2/3};
            // map to old bitmap:
            leftHand[0] = leftHand[0] / Constants.POSE_INPUT_W * (newX1 - newX0) + newX0;
            leftHand[1] = leftHand[1] / Constants.POSE_INPUT_H * (newY1 - newY0) + newY0;
            rightHand[0] = rightHand[0] / Constants.POSE_INPUT_W * (newX1 - newX0) + newX0;
            rightHand[1] = rightHand[1] / Constants.POSE_INPUT_H * (newY1 - newY0) + newY0;
            leftHand2[0] = leftHand2[0] / Constants.POSE_INPUT_W * (newX1 - newX0) + newX0;
            leftHand2[1] = leftHand2[1] / Constants.POSE_INPUT_H * (newY1 - newY0) + newY0;
            rightHand2[0] = rightHand2[0] / Constants.POSE_INPUT_W * (newX1 - newX0) + newX0;
            rightHand2[1] = rightHand2[1] / Constants.POSE_INPUT_H * (newY1 - newY0) + newY0;
            leftHand3[0] = leftHand3[0] / Constants.POSE_INPUT_W * (newX1 - newX0) + newX0;
            leftHand3[1] = leftHand3[1] / Constants.POSE_INPUT_H * (newY1 - newY0) + newY0;
            rightHand3[0] = rightHand3[0] / Constants.POSE_INPUT_W * (newX1 - newX0) + newX0;
            rightHand3[1] = rightHand3[1] / Constants.POSE_INPUT_H * (newY1 - newY0) + newY0;
            float leftHandScore = (pose[9][2] + pose[7][2]) / 2;
            float rightHandScore = (pose[10][2] + pose[8][2]) / 2;
            Log.i("ReactNative", "Left hand: " + String.valueOf(leftHandScore));
            Log.i("ReactNative", "Right hand:" + String.valueOf(rightHandScore));

            // draws to test:
            Canvas canvas = new Canvas(bitmap);
            ImageUtils.drawBoxes(boxes, canvas, Constants.OBJ_DET_CLASSES);
            ImageUtils.drawPose(new float[][]{
                    leftHand, rightHand, 
                    leftHand2, rightHand2,
                    leftHand3, rightHand3
                }, canvas);

            if (leftHandScore > Constants.MIN_HAND_SCORES || 
                rightHandScore > Constants.MIN_HAND_SCORES){
                for (float[] box: boxes){
                    int cls = (int) Math.round(box[5]);
                    if (cls == Constants.PERSON_CLS) continue;
                    if (cls == Constants.LAPTOP_CLS && !trackLaptop) continue;
                    if (cls == Constants.MOUSE_CLS && !trackMouse) continue;
                    if (cls == Constants.KEYBOARD_CLS && !trackKeyboard) continue;
                    int x0 = (int) Math.round(box[0]);
                    int y0 = (int) Math.round(box[1]);
                    int x1 = (int) Math.round(box[2]);
                    int y1 = (int) Math.round(box[3]);
                    if ((PointUtils.rectContainsPoint(x0, y0, x1, y1, leftHand[0], leftHand[1]) && leftHandScore > Constants.MIN_HAND_SCORES) ||
                        (PointUtils.rectContainsPoint(x0, y0, x1, y1, rightHand[0], rightHand[1]) && rightHandScore > Constants.MIN_HAND_SCORES)) {
                        results.pushInt(Constants.OBJ_CHEATING_MAPPING[cls]);
                        results.pushString(ImageUtils.bitmapToBase64(bitmap, 100));
                        return results;
                    } else if (cls == Constants.MOUSE_CLS && trackMouse && (
                        (PointUtils.rectContainsPoint(x0, y0, x1, y1, leftHand2[0], leftHand2[1]) && leftHandScore > Constants.MIN_HAND_SCORES) ||
                        (PointUtils.rectContainsPoint(x0, y0, x1, y1, leftHand3[0], leftHand3[1]) && leftHandScore > Constants.MIN_HAND_SCORES) ||
                        (PointUtils.rectContainsPoint(x0, y0, x1, y1, rightHand2[0], rightHand2[1]) && rightHandScore > Constants.MIN_HAND_SCORES) ||
                        (PointUtils.rectContainsPoint(x0, y0, x1, y1, rightHand3[0], rightHand3[1]) && rightHandScore > Constants.MIN_HAND_SCORES))) {
                        results.pushInt(Constants.OBJ_CHEATING_MAPPING[cls]);
                        results.pushString(ImageUtils.bitmapToBase64(bitmap, 100));
                        return results;
                    }
                }
            }

            // action:
            t0 = SystemClock.uptimeMillis();
            float[] prob = fcnetEngine.run(pose, t0);
            int maxCls = Utils.findLargestFloat(prob);
            Log.i("ReactNative", "Action result:");
            Log.i("ReactNative", Arrays.toString(prob));
            Log.i("ReactNative", Constants.ACTION_CLASSES[maxCls]);
            if (maxCls != Constants.SITTING_CLS && 
                prob[maxCls] > Constants.MIN_CONF_ACTIONS) {
                results.pushInt(Constants.CHEATING_WRONG_POSE);
                results.pushString(ImageUtils.bitmapToBase64(bitmap, 100));
                results.pushInt(maxCls);
                return results;

            }
            results.pushInt(Constants.NO_CHEATING);
            results.pushString(ImageUtils.bitmapToBase64(bitmap, 100));
            return results;
        } catch (Exception e) {
            StringWriter sw = new StringWriter();
            PrintWriter pw = new PrintWriter(sw);
            e.printStackTrace(pw);
            Log.e("ReactNative", sw.toString());
            results.pushInt(Constants.EXCEPTION_HAPPENED);
            return results;
        }
    }
}
