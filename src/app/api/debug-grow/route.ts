import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const MESHULAM_API_URL = process.env.MESHULAM_API_URL || "";
  const MESHULAM_PAGE_CODE = process.env.MESHULAM_PAGE_CODE || "";
  const MESHULAM_USER_ID = process.env.MESHULAM_USER_ID || "";

  // Test connectivity to Meshulam
  let meshulamReachable = false;
  let meshulamError = "";
  try {
    const testFormData = new FormData();
    testFormData.append("pageCode", MESHULAM_PAGE_CODE);
    testFormData.append("userId", MESHULAM_USER_ID);
    testFormData.append("processId", "0");
    testFormData.append("processToken", "test");

    const url = MESHULAM_API_URL || "https://secure.meshulam.co.il/api/light/server/1.0";
    const resp = await fetch(`${url}/getPaymentProcessInfo`, {
      method: "POST",
      body: testFormData,
    });
    const result = await resp.json();
    meshulamReachable = true;
    meshulamError = JSON.stringify(result);
  } catch (e) {
    meshulamError = String(e);
  }

  return NextResponse.json({
    env: {
      MESHULAM_API_URL: MESHULAM_API_URL ? `${MESHULAM_API_URL.substring(0, 30)}...` : "NOT SET",
      MESHULAM_PAGE_CODE: MESHULAM_PAGE_CODE ? `${MESHULAM_PAGE_CODE.substring(0, 4)}...${MESHULAM_PAGE_CODE.slice(-4)}` : "NOT SET",
      MESHULAM_USER_ID: MESHULAM_USER_ID ? `${MESHULAM_USER_ID.substring(0, 4)}...${MESHULAM_USER_ID.slice(-4)}` : "NOT SET",
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "NOT SET",
    },
    meshulamReachable,
    meshulamTestResponse: meshulamError,
  });
}
