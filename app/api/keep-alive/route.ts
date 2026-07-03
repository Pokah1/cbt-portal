import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const supabase = await createClient();

        // Lightweight query - just count categories (2 rows, never chnages)
        const {count, error} = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true });

        if (error) {
            return NextResponse.json(
                {status: 'error', message: error.message},
                {status: 500}
            )
        }
        return NextResponse.json({
            status: 'success',
            db: 'connected',
            categories: count,
            timestamp: new Date().toISOString(),
        })
    } catch  {
        return NextResponse.json(
            {status: 'error', message: 'Database connection failed'},
            {status: 500}
        )
    }
}