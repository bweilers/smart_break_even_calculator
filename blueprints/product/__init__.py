from flask import Blueprint

bp = Blueprint('product', __name__, url_prefix='/product')

from . import routes  # Import routes after creating blueprint to avoid circular imports
