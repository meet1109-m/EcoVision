"""
Deterministic Engineering Rule Engine for Industrial Process Telemetry.

Evaluates mechanical, physical, and process deviation abnormalities independently
from statistical machine learning predictions.
"""
from typing import Dict, Any, List


class ProcessRuleEngine:
    """Evaluates physical and operational rule violations on telemetry features."""

    def __init__(
        self,
        pressure_dev_threshold: float = 15.0,
        flow_dev_threshold: float = 15.0,
        temp_dev_threshold: float = 15.0,
        emission_dev_threshold: float = 25.0,
    ):
        self.pressure_dev_threshold = pressure_dev_threshold
        self.flow_dev_threshold = flow_dev_threshold
        self.temp_dev_threshold = temp_dev_threshold
        self.emission_dev_threshold = emission_dev_threshold

    def evaluate(self, reading: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluates process rules against a reading dictionary.
        Returns triggered signals, abnormality status, and rule count.
        """
        signals: List[str] = []
        violations: List[Dict[str, Any]] = []

        # 1. Pressure deviation
        pressure_dev = float(reading.get("pressure_deviation_pct", 0.0))
        if abs(pressure_dev) > self.pressure_dev_threshold:
            msg = f"Pressure deviation anomaly: {pressure_dev:+.1f}% (threshold: ±{self.pressure_dev_threshold}%)"
            signals.append(msg)
            violations.append({
                "rule": "pressure_deviation",
                "severity": "critical" if abs(pressure_dev) > 25.0 else "warning",
                "message": msg,
                "value": pressure_dev,
            })

        # 2. Flow deviation
        flow_dev = float(reading.get("flow_deviation_pct", 0.0))
        if abs(flow_dev) > self.flow_dev_threshold:
            msg = f"Flow rate deviation anomaly: {flow_dev:+.1f}% (threshold: ±{self.flow_dev_threshold}%)"
            signals.append(msg)
            violations.append({
                "rule": "flow_deviation",
                "severity": "critical" if abs(flow_dev) > 25.0 else "warning",
                "message": msg,
                "value": flow_dev,
            })

        # 3. Temperature deviation
        temp_dev = float(reading.get("temperature_deviation_pct", 0.0))
        if abs(temp_dev) > self.temp_dev_threshold:
            msg = f"Temperature deviation anomaly: {temp_dev:+.1f}% (threshold: ±{self.temp_dev_threshold}%)"
            signals.append(msg)
            violations.append({
                "rule": "temperature_deviation",
                "severity": "critical" if abs(temp_dev) > 25.0 else "warning",
                "message": msg,
                "value": temp_dev,
            })

        # 4. Emission above baseline
        emission_above_baseline = float(reading.get("emission_above_baseline_pct", 0.0))
        if emission_above_baseline > self.emission_dev_threshold:
            msg = f"Emission elevation: +{emission_above_baseline:.1f}% above historical baseline"
            signals.append(msg)
            violations.append({
                "rule": "emission_above_baseline",
                "severity": "critical" if emission_above_baseline > 100.0 else "warning",
                "message": msg,
                "value": emission_above_baseline,
            })

        # 5. Maintenance status & schedule
        maintenance_due = bool(reading.get("maintenance_due", False))
        maint_status = str(reading.get("maintenance_status", "ok")).lower()
        if maintenance_due or maint_status == "overdue":
            msg = "Equipment maintenance is overdue"
            signals.append(msg)
            violations.append({
                "rule": "maintenance_overdue",
                "severity": "warning",
                "message": msg,
                "value": maint_status,
            })
        elif maint_status == "due_soon":
            msg = "Equipment maintenance is due soon"
            signals.append(msg)
            violations.append({
                "rule": "maintenance_due_soon",
                "severity": "info",
                "message": msg,
                "value": maint_status,
            })

        # 6. Specific toxic/flammable gas thresholds
        ch4 = float(reading.get("ch4_ppm", 0.0))
        if ch4 > 50.0:
            msg = f"Elevated Methane concentration detected ({ch4:.1f} ppm)"
            signals.append(msg)
            violations.append({"rule": "ch4_ppm_high", "severity": "critical" if ch4 > 200.0 else "warning", "message": msg, "value": ch4})

        voc = float(reading.get("voc_ppm", 0.0))
        if voc > 50.0:
            msg = f"Elevated VOC concentration detected ({voc:.1f} ppm)"
            signals.append(msg)
            violations.append({"rule": "voc_ppm_high", "severity": "critical" if voc > 100.0 else "warning", "message": msg, "value": voc})

        co2 = float(reading.get("co2_ppm", 0.0))
        if co2 > 5000.0:
            msg = f"High CO2 concentration detected ({co2:.0f} ppm)"
            signals.append(msg)
            violations.append({"rule": "co2_ppm_high", "severity": "warning", "message": msg, "value": co2})

        # Determine overall rule severity
        critical_count = sum(1 for v in violations if v.get("severity") == "critical")
        warning_count = sum(1 for v in violations if v.get("severity") == "warning")

        if critical_count > 0:
            rule_severity = "critical"
        elif warning_count > 0:
            rule_severity = "warning"
        elif len(violations) > 0:
            rule_severity = "info"
        else:
            rule_severity = "normal"

        return {
            "abnormality_detected": len(signals) > 0,
            "rule_severity": rule_severity,
            "rule_count": len(signals),
            "rule_signals": signals,
            "violations": violations,
        }


# Global rule engine instance
rule_engine = ProcessRuleEngine()
