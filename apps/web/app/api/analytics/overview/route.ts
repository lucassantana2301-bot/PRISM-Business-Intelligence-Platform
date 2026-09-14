import { NextRequest, NextResponse } from 'next/server';
import { executeAnalyticsQuery, calculateConversionFunnel } from '@/lib/api/analytics_service';
import { TimeGrain } from '@/lib/contracts/analytics';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate') || '2026-10-02';
    const endDate = searchParams.get('endDate') || '2026-10-31';
    const timeGrain = (searchParams.get('timeGrain') as TimeGrain) || 'day';

    // 1. Primary KPIs with previous_period comparison
    const kpiResult = await executeAnalyticsQuery({
      metrics: ['gross_revenue', 'orders', 'conversion_rate', 'average_order_value'],
      start_date: startDate,
      end_date: endDate,
      comparison: 'previous_period',
    });

    // 2. Revenue Trend time series
    const trendResult = await executeAnalyticsQuery({
      metrics: ['net_revenue', 'orders'],
      time_grain: timeGrain,
      start_date: startDate,
      end_date: endDate,
    });

    // 3. Category Breakdown
    const categoryResult = await executeAnalyticsQuery({
      metrics: ['gross_revenue'],
      dimensions: ['category'],
      start_date: startDate,
      end_date: endDate,
    });

    // 4. Regional Performance
    const regionalResult = await executeAnalyticsQuery({
      metrics: ['net_revenue', 'orders'],
      dimensions: ['region'],
      start_date: startDate,
      end_date: endDate,
    });

    // 5. Conversion Funnel
    const funnelSteps = calculateConversionFunnel(startDate, endDate);

    // 6. Top Products (Limit 5)
    const topProductsResult = await executeAnalyticsQuery({
      metrics: ['gross_revenue', 'units_sold'],
      dimensions: ['product_id'],
      start_date: startDate,
      end_date: endDate,
      limit: 5,
    });

    return NextResponse.json({
      startDate,
      endDate,
      timeGrain,
      kpis: kpiResult.metrics_summary,
      trend: trendResult.rows,
      categories: categoryResult.rows,
      regional: regionalResult.rows,
      funnel: funnelSteps,
      topProducts: topProductsResult.rows,
      executionTimeMs:
        kpiResult.execution_time_ms +
        trendResult.execution_time_ms +
        categoryResult.execution_time_ms +
        regionalResult.execution_time_ms +
        topProductsResult.execution_time_ms,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch overview data' }, { status: 500 });
  }
}
