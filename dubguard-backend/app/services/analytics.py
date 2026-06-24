import logging
from typing import List, Dict, Any

logger = logging.getLogger("dubguard.analytics")

class AnalyticsService:
    def generate_project_report(self, evaluations: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Takes a list of dubbing evaluation results and generates aggregate analytics.
        """
        if not evaluations:
            return {"status": "NO_DATA"}
            
        total_clips = len(evaluations)
        pass_count = 0
        total_score = 0.0
        
        issues_summary = {}
        
        for eval_item in evaluations:
            total_score += eval_item.get("overall_score", 0.0)
            if eval_item.get("status") == "PASS":
                pass_count += 1
                
            # Aggregate issues
            for issue in eval_item.get("issues_detected", []):
                issues_summary[issue] = issues_summary.get(issue, 0) + 1
                
        average_score = total_score / total_clips
        pass_rate = (pass_count / total_clips) * 100
        
        # Sort issues by frequency
        sorted_issues = dict(sorted(issues_summary.items(), key=lambda item: item[1], reverse=True))
        
        return {
            "status": "SUCCESS",
            "total_clips_evaluated": total_clips,
            "average_quality_score": round(average_score, 2),
            "pass_rate_percentage": round(pass_rate, 2),
            "most_common_issues": sorted_issues
        }

analytics_service = AnalyticsService()
