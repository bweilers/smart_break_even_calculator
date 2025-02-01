from flask import render_template
from . import bp

@bp.route('/')
def index():
    return render_template('service/index.html', message="Service calculator coming soon!")
