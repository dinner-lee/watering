import { google } from "googleapis";
import type { WaterRecord } from "./types";

const SHEET_NAME = "기록";
const HEADER = ["날짜", "물 준 사람", "식물", "비고", "출처", "기록시각"];

function getClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const sheetId = process.env.GOOGLE_SHEETS_ID;
  if (!email || !key || !sheetId) {
    throw new Error(
      "Google Sheets 환경변수(GOOGLE_SHEETS_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY)가 설정되지 않았습니다."
    );
  }
  const auth = new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return { sheets: google.sheets({ version: "v4", auth }), sheetId };
}

async function ensureHeader(sheets: ReturnType<typeof google.sheets>, sheetId: string) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${SHEET_NAME}!A1:F1`,
  });
  const firstRow = res.data.values?.[0];
  if (!firstRow || firstRow.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${SHEET_NAME}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [HEADER] },
    });
  }
}

export async function getRecords(): Promise<WaterRecord[]> {
  const { sheets, sheetId } = getClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${SHEET_NAME}!A2:F`,
  });
  const rows = res.data.values ?? [];
  return rows
    .filter((r) => r[0] && r[2]) // 날짜와 식물이 있어야 유효
    .map((r) => ({
      date: r[0] ?? "",
      person: r[1] ?? "",
      plant: r[2] ?? "",
      note: r[3] ?? "",
      source: r[4] ?? "",
      createdAt: r[5] ?? "",
    }));
}

export async function appendRecords(records: WaterRecord[]): Promise<number> {
  if (records.length === 0) return 0;
  const { sheets, sheetId } = getClient();
  await ensureHeader(sheets, sheetId);
  const values = records.map((r) => [r.date, r.person, r.plant, r.note, r.source, r.createdAt]);
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: `${SHEET_NAME}!A:F`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values },
  });
  return records.length;
}
