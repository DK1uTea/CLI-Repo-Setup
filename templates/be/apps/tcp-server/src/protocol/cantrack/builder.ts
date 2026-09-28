// Tạo response packet gửi lại thiết bị CANTRACK
// Nếu không ACK, thiết bị sẽ retry liên tục gây flood connection.

/**
 * HTBT ACK — server echo lại battery% để thiết bị biết đã nhận
 *
 * Device gửi:  *HQ,IMEI,HTBT,100,1200#
 * Server trả:  *HQ,IMEI,HTBT,100#
 */
export function htbtAck(imei: string, battery: number | undefined): string {
  return battery !== undefined ? `*HQ,${imei},HTBT,${battery}#` : `*HQ,${imei},HTBT#`;
}

/**
 * ICCID ACK — server xác nhận đã nhận ICCID của SIM
 *
 * Device gửi:  *HQ,IMEI,ICCID,89860121801609042193#
 * Server trả:  *HQ,IMEI,ICCID#
 */
export function iccidAck(imei: string): string {
  return `*HQ,${imei},ICCID#`;
}
