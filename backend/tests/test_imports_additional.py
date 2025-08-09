import importlib

def test_backend_package_importable():
    mod = importlib.import_module('backend')
    assert mod is not None


def test_handler_module_importable():
    mod = importlib.import_module('backend.lambdas.farms.handler')
    assert mod is not None


def test_handler_has_callable():
    mod = importlib.import_module('backend.lambdas.farms.handler')
    # adjust the attribute name if your entry point differs (e.g., lambda_handler)
    entry = getattr(mod, 'handler', None) or getattr(mod, 'lambda_handler', None)
    assert callable(entry), "Expected a callable 'handler' or 'lambda_handler' in handler module"