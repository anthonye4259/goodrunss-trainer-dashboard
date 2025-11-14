import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/i18n/currency/rates
 * Get current exchange rates
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fromCurrency = searchParams.get('from') || 'USD';
    const toCurrency = searchParams.get('to');

    if (toCurrency) {
      // Get specific rate
      const rate = await prisma.currencyRate.findFirst({
        where: {
          fromCurrency,
          toCurrency,
          isActive: true,
        },
        orderBy: { validFrom: 'desc' },
      });

      if (!rate) {
        return NextResponse.json(
          { error: 'Exchange rate not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ rate: Number(rate.rate) });
    }

    // Get all rates from base currency
    const rates = await prisma.currencyRate.findMany({
      where: {
        fromCurrency,
        isActive: true,
      },
      orderBy: { validFrom: 'desc' },
    });

    const ratesMap = rates.reduce((acc, rate) => {
      if (!acc[rate.toCurrency]) {
        acc[rate.toCurrency] = Number(rate.rate);
      }
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({ rates: ratesMap, base: fromCurrency });
  } catch (error) {
    console.error('Error fetching currency rates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch currency rates' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/i18n/currency/convert
 * Convert amount between currencies
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, fromCurrency, toCurrency } = body;

    if (!amount || !fromCurrency || !toCurrency) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Same currency, no conversion
    if (fromCurrency === toCurrency) {
      return NextResponse.json({
        originalAmount: amount,
        convertedAmount: amount,
        rate: 1,
        fromCurrency,
        toCurrency,
      });
    }

    // Get exchange rate
    const rate = await prisma.currencyRate.findFirst({
      where: {
        fromCurrency,
        toCurrency,
        isActive: true,
      },
      orderBy: { validFrom: 'desc' },
    });

    if (!rate) {
      return NextResponse.json(
        { error: 'Exchange rate not available' },
        { status: 404 }
      );
    }

    const convertedAmount = amount * Number(rate.rate);

    return NextResponse.json({
      originalAmount: amount,
      convertedAmount: Math.round(convertedAmount * 100) / 100,
      rate: Number(rate.rate),
      fromCurrency,
      toCurrency,
      rateUpdated: rate.validFrom,
    });
  } catch (error) {
    console.error('Error converting currency:', error);
    return NextResponse.json(
      { error: 'Failed to convert currency' },
      { status: 500 }
    );
  }
}
