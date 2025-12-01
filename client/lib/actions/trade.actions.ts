"use server"

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-option";
import { revalidatePath } from "next/cache";

// Định nghĩa kiểu dữ liệu khớp với DTO của Java
interface MarketOrderParams {
    symbol: string;
    quantity: number;
    side: "buy" | "sell";
}

export async function executeMarketOrder(params: MarketOrderParams) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return { success: false, message: "Unauthorized" };
    }

    // Lấy Token từ session (giả sử bạn lưu JWT trong session)
    const accessToken = session.accessToken;

    // URL Backend Spring Boot của bạn
    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;
    const endpoint = params.side === "buy" ? "/trades/buy" : "/trades/sell";

    try {
        const response = await fetch(`${BACKEND_URL}${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                coinSymbol: params.symbol,
                quantity: params.quantity
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return { success: false, message: data.message || "Giao dịch thất bại" };
        }

        revalidatePath("/trade");
        return { success: true, message: "Khớp lệnh thành công!", data };

    } catch (error) {
        console.error("Trade Error:", error);
        return { success: false, message: "Lỗi kết nối Server" };
    }
}