from flask import render_template, request, session, jsonify, redirect, url_for, Response
import openai
from . import bp
from functools import wraps
import json

def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get('authenticated'):
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated

def init_session():
    if 'data' not in session:
        session['data'] = {
            'product_description': '',
            'target_audience': '',
            'location': '',
            'price_range': 0,
            'cost_of_goods': 0,
            'overhead_costs': 0,
            'startup_costs': 0,
            'marketing_budget': 0,
            'sales_volume': 0,
            'time_horizon': 0,
            'ai_suggestions': {}
        }

@bp.route('/', methods=['GET', 'POST'])
@requires_auth
def index():
    if request.method == 'POST':
        return redirect(url_for('product.step1'))
        
    # Preserve authentication status while clearing other session data
    auth_status = session.get('authenticated', False)
    session.clear()
    session['authenticated'] = auth_status
    init_session()
    return render_template('product/step1.html')

@bp.route('/step1', methods=['GET', 'POST'])
@requires_auth
def step1():
    if request.method == 'POST':
        product_description = request.form.get('product_description')
        if 'data' not in session:
            init_session()
        session['data']['product_description'] = product_description
        session.modified = True
        print(f"Debug - Step 1 - Saved product description: {session['data']['product_description']}")
        return redirect(url_for('product.step2'))
    return render_template('product/step1.html')

@bp.route('/step2', methods=['GET', 'POST'])
@requires_auth
def step2():
    if 'data' not in session or not session['data'].get('product_description'):
        return redirect(url_for('product.step1'))

    if request.method == 'POST':
        target_audience = request.form.get('target_audience')
        location = request.form.get('location')
        
        session['data']['target_audience'] = target_audience
        session['data']['location'] = location
        session.modified = True
        
        print(f"Debug - Step 2 - Current session data: {session['data']}")
        return redirect(url_for('product.step3'))
    
    return render_template('product/step2.html')

@bp.route('/step3', methods=['GET', 'POST'])
@requires_auth
def step3():
    if 'data' not in session or not session['data'].get('target_audience'):
        return redirect(url_for('product.step2'))
    
    print(f"Debug - Step 3 - Current session data: {session['data']}")
    
    if request.method == 'POST':
        price = request.form.get('price')
        
        # Generate AI suggestion if requested
        if 'get_suggestion' in request.form:
            prompt = f"""
            Based on the following information, provide a market analysis and price suggestion:
            - Product/Service: {session['data']['product_description']}
            - Target Market: {session['data']['target_audience']} in {session['data']['location']}
            
            Please provide:
            1. A brief market analysis considering:
               - Target audience demographics and purchasing power
               - Market competition and positioning
               - Local market conditions in {session['data']['location']}
               - Value proposition for the product/service
            
            2. A specific price recommendation formatted exactly as: 'FINAL SUGGESTION: $X,XXX.XX'
            
            Start with the analysis and end with the final suggestion.
            """
            ai_suggestion = get_ai_suggestion(prompt)
            session['data']['ai_suggestions']['price_range'] = ai_suggestion
            session.modified = True
            return jsonify({'suggestion': ai_suggestion})
        
        session['data']['price_range'] = float(price)
        session.modified = True
        return redirect(url_for('product.step4'))
    
    return render_template('product/step3.html')

@bp.route('/step4', methods=['GET', 'POST'])
@requires_auth
def step4():
    if 'data' not in session or not session['data'].get('price_range'):
        return redirect(url_for('product.step3'))
    
    if request.method == 'POST':
        cost = request.form.get('cost')
        
        # Generate AI suggestion if requested
        if 'get_suggestion' in request.form:
            prompt = f"""
            Based on the following information, suggest the cost of goods for manufacturing/acquiring this product:
            - Product/Service: {session['data']['product_description']}
            - Target Market: {session['data']['target_audience']} in {session['data']['location']}
            - Selling Price: ${session['data']['price_range']}
            
            Please provide a specific cost (just the number) that would be realistic for this product.
            """
            ai_suggestion = get_ai_suggestion(prompt)
            session['data']['ai_suggestions']['cost_of_goods'] = ai_suggestion
            session.modified = True
            return jsonify({'suggestion': ai_suggestion})
        
        session['data']['cost_of_goods'] = float(cost)
        session.modified = True
        return redirect(url_for('product.step5'))
    
    return render_template('product/step4.html')

@bp.route('/step5', methods=['GET', 'POST'])
@requires_auth
def step5():
    if 'data' not in session or not session['data'].get('cost_of_goods'):
        return redirect(url_for('product.step4'))
    
    if request.method == 'POST':
        overhead = request.form.get('overhead')
        
        # Generate AI suggestion if requested
        if 'get_suggestion' in request.form:
            prompt = f"""
            Based on the following information, suggest monthly overhead costs for this business:
            - Product/Service: {session['data']['product_description']}
            - Location: {session['data']['location']}
            - Price per Unit: ${session['data']['price_range']}
            - Cost per Unit: ${session['data']['cost_of_goods']}
            
            Consider typical overhead costs such as:
            - Rent/lease costs in {session['data']['location']}
            - Utilities
            - Insurance
            - Employee salaries
            - Administrative expenses
            
            Please provide a specific monthly overhead cost (just the number) that would be realistic for this business.
            """
            ai_suggestion = get_ai_suggestion(prompt)
            session['data']['ai_suggestions']['overhead_costs'] = ai_suggestion
            session.modified = True
            return jsonify({'suggestion': ai_suggestion})
        
        session['data']['overhead_costs'] = float(overhead)
        session.modified = True
        return redirect(url_for('product.step6'))
    
    return render_template('product/step5.html')

@bp.route('/step6', methods=['GET', 'POST'])
@requires_auth
def step6():
    if 'data' not in session or not session['data'].get('overhead_costs'):
        return redirect(url_for('product.step5'))
    
    if request.method == 'POST':
        # Handle form submission
        if not 'get_suggestion' in request.form:
            startup_costs = request.form.get('startup_costs', type=float)
            marketing_budget = request.form.get('marketing_budget', type=float)
            sales_volume = request.form.get('sales_volume', type=int)
            time_horizon = request.form.get('time_horizon', type=int)
            
            # Save form data to session
            session['data'].update({
                'startup_costs': startup_costs,
                'marketing_budget': marketing_budget,
                'sales_volume': sales_volume,
                'time_horizon': time_horizon
            })
            session.modified = True
            
            return redirect(url_for('product.summary'))
        
        # Handle AI suggestion requests
        field = request.form.get('field')
        if not field:
            return jsonify({'error': 'No field specified for suggestion'}), 400
            
        base_prompt = f"""
        Based on the following information about a business:
        - Product: {session['data']['product_description']}
        - Location: {session['data']['location']}
        - Target Market: {session['data']['target_audience']}
        - Price per Unit: ${session['data']['price_range']}
        - Cost per Unit: ${session['data']['cost_of_goods']}
        - Monthly Overhead: ${session['data']['overhead_costs']}
        """
        
        prompts = {
            'startup_costs': base_prompt + """
            Please suggest a realistic initial startup cost for this business.
            Consider equipment, inventory, licenses, and other initial expenses.
            Provide just the number in dollars.""",
            
            'marketing_budget': base_prompt + """
            Please suggest a realistic monthly marketing budget for this business.
            Consider digital marketing, advertising, and promotional activities.
            Provide just the number in dollars.""",
            
            'sales_volume': base_prompt + """
            Please suggest a realistic monthly sales volume (number of units) for this business.
            Consider the market size, competition, and price point.
            Provide just the number of units.""",
            
            'time_horizon': base_prompt + """
            Please suggest a realistic number of months to reach break-even for this business.
            Consider the startup costs, monthly expenses, and expected sales.
            Provide just the number of months."""
        }
        
        if field not in prompts:
            return jsonify({'error': 'Invalid field specified'}), 400
            
        suggestion = get_ai_suggestion(prompts[field])
        
        # Store the suggestion in the session
        if 'ai_suggestions' not in session['data']:
            session['data']['ai_suggestions'] = {}
        session['data']['ai_suggestions'][field] = suggestion
        session.modified = True
        
        return jsonify({'suggestion': suggestion})
    
    return render_template('product/step6.html')

@bp.route('/get_ai_suggestion', methods=['POST'])
@requires_auth
def get_ai_suggestion_endpoint():
    try:
        data = request.get_json()
        step = data.get('step')
        
        if step in ['price', 'cost']:
            # Get data from session
            product_description = session['data'].get('product_description', '')
            target_audience = session['data'].get('target_audience', '')
            location = session['data'].get('location', '')
            price_range = session['data'].get('price_range', 0)
            
            if step == 'price':
                prompt = f"""
                Based on the following information, provide a market analysis and price suggestion:
                - Product/Service: {product_description}
                - Target Market: {target_audience} in {location}
                
                Please provide:
                1. A brief market analysis considering:
                   - Target audience demographics and purchasing power
                   - Market competition and positioning
                   - Local market conditions in {location}
                   - Value proposition for the product/service
                
                2. A specific price recommendation formatted exactly as: 'FINAL SUGGESTION: $X,XXX.XX'
                
                Start with the analysis and end with the final suggestion.
                """
            else:  # step == 'cost'
                prompt = f"""
                Based on the following information, provide a cost analysis and suggestion:
                - Product/Service: {product_description}
                - Target Market: {target_audience} in {location}
                - Planned Selling Price: ${price_range:.2f}
                
                Please provide:
                1. A brief cost analysis considering:
                   - Manufacturing/sourcing costs
                   - Material quality requirements
                   - Supply chain considerations
                   - Profit margin analysis (based on selling price of ${price_range:.2f})
                
                2. A specific cost recommendation formatted exactly as: 'FINAL SUGGESTION: $X,XXX.XX'
                
                Start with the analysis and end with the final suggestion.
                """
            
            def generate():
                try:
                    response = openai.ChatCompletion.create(
                        model="gpt-3.5-turbo",
                        messages=[
                            {"role": "system", "content": "You are a helpful business advisor. Provide a concise but complete analysis followed by a specific suggestion. Always end your response with 'FINAL SUGGESTION: $X,XXX.XX' on a new line."},
                            {"role": "user", "content": prompt}
                        ],
                        max_tokens=1000,  # Increased from 500 to 1000
                        temperature=0.7,
                        stream=True
                    )
                    
                    for chunk in response:
                        if chunk and chunk.choices and chunk.choices[0].delta and hasattr(chunk.choices[0].delta, 'content') and chunk.choices[0].delta.content:
                            content = chunk.choices[0].delta.content
                            yield f"data: {json.dumps({'content': content})}\n\n"
                            
                except Exception as e:
                    print(f"Error in streaming: {str(e)}")
                    yield f"data: {json.dumps({'error': str(e)})}\n\n"
            
            return Response(generate(), mimetype='text/event-stream')
        
        return jsonify({'error': 'Invalid step specified'})
    except Exception as e:
        print(f"Error in get_ai_suggestion_endpoint: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/summary')
@requires_auth
def summary():
    if 'data' not in session:
        return redirect(url_for('product.index'))
    
    data = session['data']
    
    # Calculate monthly revenue
    monthly_revenue = data['price_range'] * data['sales_volume']
    
    # Calculate monthly costs
    monthly_costs = (data['cost_of_goods'] * data['sales_volume']) + data['overhead_costs'] + data['marketing_budget']
    
    # Calculate monthly profit/loss
    monthly_profit = monthly_revenue - monthly_costs
    
    # Calculate total investment needed
    total_investment = data['startup_costs'] + (monthly_costs * 3)  # 3 months of operating costs
    
    # Calculate months to break even
    months_to_breakeven = abs(total_investment / monthly_profit) if monthly_profit > 0 else float('inf')
    
    return render_template('product/summary.html',
                         data=data,
                         monthly_revenue=monthly_revenue,
                         monthly_costs=monthly_costs,
                         monthly_profit=monthly_profit,
                         total_investment=total_investment,
                         months_to_breakeven=months_to_breakeven)

def get_ai_suggestion(prompt):
    try:
        print(f"Debug - AI Prompt: {prompt}")
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful business advisor. Provide a concise but complete market analysis followed by a price suggestion. Always end your response with 'FINAL SUGGESTION: $X,XXX.XX' on a new line."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=500,  # Increased from 50 to 500
            temperature=0.7
        )
        suggestion = response.choices[0].message.content.strip()
        print(f"Debug - Raw AI Response: {suggestion}")
        
        # Ensure we have both analysis and final suggestion
        if not suggestion.endswith('XX') and 'FINAL SUGGESTION: $' not in suggestion:
            print("Debug - Response doesn't contain proper final suggestion format")
            return "Error: Invalid response format from AI. Please try again."
        
        return suggestion
    except Exception as e:
        print(f"Debug - Error in get_ai_suggestion: {str(e)}")
        return f"Error: Could not get AI suggestion - {str(e)}"
