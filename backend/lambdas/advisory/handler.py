import json, uuid
from aws_lambda_powertools import Logger
from backend.lambdas.common.validation import AdvisoryRequest, validate

logger = Logger(service="advisory")

def _response(status: int, body: dict):
    return {
        "statusCode": status,
        "headers": {"content-type": "application/json"},
        "body": json.dumps(body),
    }

def handler(event, _context):
    """
    POST /advisory -> stub a recommendation
    GET  /advisory/{id} -> mock fetch
    """
    rc = event.get("requestContext", {}).get("http", {})
    method = rc.get("method", "")
    path = rc.get("path", "")

    if method == "POST" and path.endswith("/advisory"):
        body = json.loads(event.get("body") or "{}")
        ok, result = validate(AdvisoryRequest, body)
        if not ok:
            return _response(400, {"message": "Invalid payload", "errors": result})

        adv_id = str(uuid.uuid4())
        # Stubbed recommendation—later we’ll swap in SageMaker / rules engine.
        rec = {
            "advisoryId": adv_id,
            "crop": result.crop,
            "actions": [
                "Soil test first (pH, NPK)",
                "Irrigate lightly for 3 days after sowing",
                "Use seed spacing per local agri board",
            ],
        }
        logger.info({"msg": "advisory.create", "advisoryId": adv_id})
        return _response(201, rec)

    if method == "GET" and "/advisory/" in path:
        # Mock “fetch by id” response
        adv_id = path.rsplit("/", 1)[-1]
        return _response(200, {"advisoryId": adv_id, "status": "PENDING", "note": "stub"})

    return _response(404, {"message": "Not Found"})
