export const msecToHHMMSS = (time) => {
    time = Math.round(time/1000);
    let h = String(Math.floor(time/3600));
    if (h.length < 2) h = "0" + h;
    time -= h*3600;
    let m = String(Math.floor(time/60));
    if (m.length < 2) m = "0" + m;
    time -= m*60;
    let s = String(time);
    if (s.length < 2) s = "0" + s;
    return `${h}:${m}:${s}`;
  }

export const toHHMMSS = (time) => {
    return time.toISOString().substr(11, 8);
}

export const toDDMMYYHHSS = (time) => {
    let timeStr = time.toISOString()
    return timeStr.substr(0, 10) + " " + timeStr.substr(11, 8);
  }