import importlib


def test_backend_package_importable():
    mod = importlib.import_module('backend')
    assert mod is not None


def test_handler_module_importable():
    mod = importlib.import_module('backend.lambdas.farms.handler')
    assert mod is not None


def test_handler_callable_present():
    mod = importlib.import_module('backend.lambdas.farms.handler')
    assert hasattr(mod, 'handler') and callable(mod.handler), "Expected callable 'handler' in handler module"