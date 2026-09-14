"""
PRISM Seasonality Engine, Funnel Modeling & Ground-Truth Business Anomaly Injector
"""

from datetime import datetime, date
from typing import Dict, Any, Tuple, Optional, List

# ==================== INTENTIONAL ANOMALY DEFINITIONS ====================
INTENTIONAL_ANOMALIES: List[Dict[str, Any]] = [
    {
        "event_id": "EVENT-01",
        "name": "Mobile iOS Gateway Conversion Degradation",
        "start_date": "2026-10-12",
        "end_date": "2026-10-18",
        "affected_dimensions": {
            "device_type": ["Mobile iOS"],
            "funnel_step": "checkout_to_purchase"
        },
        "analytical_effect": "Mobile iOS checkout completion drops by ~35% due to payment gateway timeout. Total CR drops from ~3.1% to ~2.0%.",
        "severity": "critical",
        "category": "Funnel Anomaly"
    },
    {
        "event_id": "EVENT-02",
        "name": "Electronics Flash Campaign Surge in Southeast",
        "start_date": "2026-09-01",
        "end_date": "2026-09-08",
        "affected_dimensions": {
            "category": ["Electronics"],
            "region": ["Southeast"],
            "channel": ["Email Marketing", "Paid Search (Google)"]
        },
        "analytical_effect": "Electronics category gross revenue surges +140% in SP and RJ, driving peak daily revenue over $55k with 5.2x ROAS.",
        "severity": "opportunity",
        "category": "Marketing Lift"
    },
    {
        "event_id": "EVENT-03",
        "name": "Paid Social High-CAC / Low-Conversion Campaign",
        "start_date": "2026-07-15",
        "end_date": "2026-07-22",
        "affected_dimensions": {
            "channel": ["Paid Social (Meta/TikTok)"],
            "category": ["Beauty & Health"]
        },
        "analytical_effect": "Paid Social traffic doubles (+100% sessions), but conversion rate drops by 50%, resulting in ROAS dropping from 3.8x to 1.6x.",
        "severity": "warning",
        "category": "Ad Inefficiency"
    },
    {
        "event_id": "EVENT-04",
        "name": "Breakout High-Margin Product Growth in Home & Living",
        "start_date": "2026-08-01",
        "end_date": "2026-10-31",
        "affected_dimensions": {
            "subcategory": ["Kitchen Appliances"],
            "product": "Digital Air Fryer 5.5L Inox"
        },
        "analytical_effect": "Breakout viral demand increases unit sales of Digital Air Fryer by 220%, lifting Home & Living category margin contribution.",
        "severity": "opportunity",
        "category": "Product Trend"
    },
    {
        "event_id": "EVENT-05",
        "name": "Cart Abandonment Surge from Freight Policy Friction",
        "start_date": "2026-05-18",
        "end_date": "2026-05-25",
        "affected_dimensions": {
            "category": ["Home & Living", "Sports & Outdoors"],
            "device_type": ["Desktop"]
        },
        "analytical_effect": "Cart abandonment increases from 72% to 86% on heavy items (>$300) during a free-shipping threshold test.",
        "severity": "warning",
        "category": "Checkout Friction"
    }
]


def get_seasonal_multiplier(d: date) -> float:
    """
    Calculates overall commercial volume multiplier based on Brazilian calendar events,
    month-of-year, and day-of-week seasonality.
    """
    # 1. Day of Week multiplier (Monday-Thursday ~1.05, Friday ~1.15, Sat ~0.80, Sun ~0.90)
    weekday = d.weekday()
    dow_multipliers = {
        0: 1.05,  # Mon
        1: 1.02,  # Tue
        2: 1.04,  # Wed
        3: 1.08,  # Thu
        4: 1.15,  # Fri
        5: 0.82,  # Sat
        6: 0.92,  # Sun
    }
    dow_mult = dow_multipliers.get(weekday, 1.0)

    # 2. Base Month of Year multiplier
    month_multipliers = {
        1: 1.08,   # Jan (Summer sales)
        2: 0.86,   # Feb (Carnaval post-holiday lull)
        3: 1.04,   # Mar (Dia do Consumidor)
        4: 0.98,   # Apr
        5: 1.22,   # May (Dia das Mães)
        6: 1.16,   # Jun (Dia dos Namorados)
        7: 0.95,   # Jul
        8: 1.02,   # Aug (Dia dos Pais)
        9: 1.05,   # Sep (Semana do Brasil)
        10: 1.08,  # Oct (Dia das Crianças)
        11: 1.65,  # Nov (Black Friday month)
        12: 1.48,  # Dec (Natal & Ano Novo)
    }
    month_mult = month_multipliers.get(d.month, 1.0)

    # 3. High-impact calendar events (Black Friday, Cyber Monday, Christmas peak, Mother's day)
    event_mult = 1.0

    # Black Friday period (last week of November)
    if d.month == 11 and 20 <= d.day <= 28:
        if d.weekday() == 4:  # Black Friday itself
            event_mult = 3.6
        elif d.weekday() == 0 and d.day >= 24:  # Cyber Monday
            event_mult = 2.4
        else:
            event_mult = 1.8

    # Christmas shopping peak (Dec 10 to Dec 23)
    elif d.month == 12 and 10 <= d.day <= 23:
        event_mult = 2.1

    # Dia das Mães (First 10 days of May)
    elif d.month == 5 and 1 <= d.day <= 10:
        event_mult = 1.75

    # Dia dos Namorados (June 5 to June 12)
    elif d.month == 6 and 5 <= d.day <= 12:
        event_mult = 1.55

    # Dia do Consumidor (Mid March)
    elif d.month == 3 and 12 <= d.day <= 16:
        event_mult = 1.45

    return dow_mult * month_mult * event_mult


def evaluate_active_anomalies(d: date) -> Dict[str, Any]:
    """
    Checks if current date falls within any intentional anomaly windows and returns modifiers.
    """
    d_str = d.strftime("%Y-%m-%d")
    active_modifiers: Dict[str, Any] = {
        "mobile_ios_checkout_penalty": 1.0,
        "electronics_se_surge": 1.0,
        "paid_social_beauty_traffic_boost": 1.0,
        "paid_social_beauty_cr_penalty": 1.0,
        "air_fryer_demand_boost": 1.0,
        "cart_abandonment_heavy_surge": 1.0,
    }

    # EVENT-01: Mobile iOS Gateway drop (Oct 12-18, 2026)
    if "2026-10-12" <= d_str <= "2026-10-18":
        active_modifiers["mobile_ios_checkout_penalty"] = 0.65

    # EVENT-02: Electronics Flash Campaign in SE (Sep 01-08, 2026)
    if "2026-09-01" <= d_str <= "2026-09-08":
        active_modifiers["electronics_se_surge"] = 2.4

    # EVENT-03: Paid Social Beauty traffic boost + CR drop (Jul 15-22, 2026)
    if "2026-07-15" <= d_str <= "2026-07-22":
        active_modifiers["paid_social_beauty_traffic_boost"] = 2.0
        active_modifiers["paid_social_beauty_cr_penalty"] = 0.50

    # EVENT-04: Breakout Air Fryer (Aug 01 to Oct 31, 2026)
    if "2026-08-01" <= d_str <= "2026-10-31":
        active_modifiers["air_fryer_demand_boost"] = 3.2

    # EVENT-05: Cart abandonment on heavy items (May 18-25, 2026)
    if "2026-05-18" <= d_str <= "2026-05-25":
        active_modifiers["cart_abandonment_heavy_surge"] = 1.6

    return active_modifiers
