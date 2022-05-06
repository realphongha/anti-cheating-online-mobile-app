export const toHHMMSS = (time) => {
    return time.toISOString().substr(11, 8);
}

export const toDDMMYYHHSS = (time) => {
    let timeStr = time.toISOString()
    return timeStr.substr(0, 10) + " " + timeStr.substr(11, 8);
  }