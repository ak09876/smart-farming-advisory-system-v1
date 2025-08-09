import json, os, uuid
from aws_lambda_powertools import Logger
from backend.lambdas.common.validation import FarmCreate, validate

logger = Logger(service="farms")

def _response(status: int, body: dict):
    return {
        "statusCode": status,
        "headers": {"content-type": "application/json"},
        "body": json.dumps(body),
    }

def handler(event, _context):
    """
    HTTP API (payload v2.0) expected.
    POST /farms
    """
    method = event.get("requestContext", {}).get("http", {}).get("method", "")
    if method != "POST":
        return _response(405, {"message": "Method Not Allowed"})

    body = json.loads(event.get("body") or "{}")
    ok, result = validate(FarmCreate, body)
    if not ok:
        return _response(400, {"message": "Invalid payload", "errors": result})

    farm = result.model_dump()
    farm_id = str(uuid.uuid4())
    # NOTE: For the MVP, we don't hit DynamoDB yet—keeps CI fast and no AWS needed.
    # Later: write to DynamoDB table from env FARMS_TABLE.
    logger.info({"msg": "farm.create", "farmId": farm_id})

    return _response(201, {"farmId": farm_id, "farm": farm})