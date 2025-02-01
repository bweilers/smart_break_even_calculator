from flask import Blueprint

bp = Blueprint('subscription', __name__, url_prefix='/subscription')

from . import routes  # Import routes after creating blueprint to avoid circular imports
