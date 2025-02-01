from flask import render_template
from . import bp

@bp.route('/')
def index():
    return render_template('subscription/index.html', message="Subscription calculator coming soon!")
