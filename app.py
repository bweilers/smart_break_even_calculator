from flask import Flask, render_template, request, session, jsonify, redirect, url_for
import os
from dotenv import load_dotenv
from openai import OpenAI


load_dotenv()

app = Flask(__name__)
# Set a fixed secret key instead of a random one that changes on restart
app.secret_key = 'your-super-secret-key-here'  # In production, use a proper secret key
client = OpenAI(
    api_key=os.getenv('OPENAI_API_KEY'),
    default_headers={"x-stainless-arch": "n/a"}
)

# Initialize session data structure
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
        session.modified = True


def get_ai_suggestion(prompt):
    try:
        print(f"Debug - Sending prompt to OpenAI: {prompt}")  # Debug print
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": """You are a business analyst helping entrepreneurs estimate costs and metrics for their business.
                Always structure your response as follows:
                1. Detailed explanation and analysis
                2. Breakdown of components (if applicable)
                3. End with 'FINAL SUGGESTION: $X,XXX.XX' on a new line, where X,XXX.XX is your final suggested amount"""},
                {"role": "user", "content": prompt}
            ]
        )
        return response.choices[0].message.content, prompt  # Return both response and prompt
    except Exception as e:
        return f"Error getting AI suggestion: {str(e)}", prompt

@app.route('/')
def index():
    # Always initialize session when starting
    session.clear()
    init_session()
    return render_template('step1.html')

@app.route('/step1', methods=['GET', 'POST'])
def step1():
    if request.method == 'POST':
        product_description = request.form.get('product_description')
        if not product_description:
            return render_template('step1.html', error="Please provide a product description")
        
        if 'data' not in session:
            init_session()
        
        session['data']['product_description'] = product_description
        session.modified = True
        print(f"Debug - Step 1 - Saved product description: {session['data']['product_description']}")
        return redirect(url_for('step2'))
    
    return render_template('step1.html')

@app.route('/step2', methods=['GET', 'POST'])
def step2():
    if 'data' not in session or not session['data'].get('product_description'):
        return redirect(url_for('step1'))
    
    if request.method == 'POST':
        target_audience = request.form.get('target_audience')
        location = request.form.get('location')
        
        if not target_audience or not location:
            return render_template('step2.html', error="Please fill in all fields")
        
        session['data']['target_audience'] = target_audience
        session['data']['location'] = location
        session.modified = True
        
        print(f"Debug - Step 2 - Current session data: {session['data']}")
        return redirect(url_for('step3'))
    
    return render_template('step2.html')

@app.route('/step3', methods=['GET', 'POST'])
def step3():
    if 'data' not in session or not session['data'].get('target_audience'):
        return redirect(url_for('step2'))
    
    print(f"Debug - Step 3 - Current session data: {session['data']}")
    
    if request.method == 'POST':
        price = request.form.get('price_range')
        if not price:
            prompt = f"""Based on the following business details, what would be a good price point?
            - Product/Service: {session['data']['product_description']}
            - Target Market: {session['data']['target_audience']} in {session['data']['location']}
            
            Consider:
            - Target market's purchasing power
            - Competitor pricing
            - Perceived value
            - Market positioning
            
            Provide analysis and end with FINAL SUGGESTION: $XX.XX"""
            
            ai_suggestion, debug_prompt = get_ai_suggestion(prompt)
            session['data']['ai_suggestions']['price_range'] = ai_suggestion
            session.modified = True
            return render_template('step3.html', ai_suggestion=ai_suggestion, debug_prompt=debug_prompt)
        
        session['data']['price_range'] = float(price)
        session.modified = True
        return redirect(url_for('step4'))
    
    return render_template('step3.html')
    
@app.route('/step4', methods=['GET', 'POST'])
def step4():
    if 'data' not in session or not session['data'].get('price_range'):
        return redirect(url_for('step3'))
    
    if request.method == 'POST':
        cost = request.form.get('cost_of_goods')
        if not cost:
            prompt = f"""Based on the following business details, what would be the cost of goods per unit?
            - Product/Service: {session['data']['product_description']}
            - Target Market: {session['data']['target_audience']} in {session['data']['location']}
            - Selling Price: ${session['data']['price_range']}
            
            Consider:
            - Material costs
            - Labor costs
            - Manufacturing/production costs
            - Industry standard margins
            
            Provide analysis and end with FINAL SUGGESTION: $XX.XX"""
            
            ai_suggestion, debug_prompt = get_ai_suggestion(prompt)
            session['data']['ai_suggestions']['cost_of_goods'] = ai_suggestion
            session.modified = True
            return render_template('step4.html', ai_suggestion=ai_suggestion, debug_prompt=debug_prompt)
        
        session['data']['cost_of_goods'] = float(cost)
        session.modified = True
        return redirect(url_for('step5'))
    
    return render_template('step4.html')

@app.route('/step5', methods=['GET', 'POST'])
def step5():
    if 'data' not in session or not session['data'].get('cost_of_goods'):
        return redirect(url_for('step4'))
    
    if request.method == 'POST':
        overhead = request.form.get('overhead_costs')
        if not overhead:
            prompt = f"""Based on the following business details, what would be typical monthly overhead costs?
            - Product/Service: {session['data']['product_description']}
            - Location: {session['data']['location']}
            - Price per Unit: ${session['data']['price_range']}
            - Cost per Unit: ${session['data']['cost_of_goods']}
            
            Consider:
            - Rent/lease costs in {session['data']['location']}
            - Utility costs
            - Insurance
            - Employee salaries
            - Other fixed costs
            
            Provide analysis and end with FINAL SUGGESTION: $X,XXX.XX"""
            
            ai_suggestion, debug_prompt = get_ai_suggestion(prompt)
            session['data']['ai_suggestions']['overhead_costs'] = ai_suggestion
            session.modified = True
            return render_template('step5.html', ai_suggestion=ai_suggestion, debug_prompt=debug_prompt)
        
        session['data']['overhead_costs'] = float(overhead)
        session.modified = True
        return redirect(url_for('step6'))
    
    return render_template('step5.html')

@app.route('/step6', methods=['GET', 'POST'])
def step6():
    if 'data' not in session or not session['data'].get('overhead_costs'):
        return redirect(url_for('step5'))
    
    if request.method == 'POST':
        startup_costs = request.form.get('startup_costs')
        if not startup_costs:
            prompt = f"""Based on the following business details, what would be reasonable startup costs?
            - Product/Service: {session['data']['product_description']}
            - Target Market: {session['data']['target_audience']} in {session['data']['location']}
            - Price per Unit: ${session['data']['price_range']}
            - Cost per Unit: ${session['data']['cost_of_goods']}
            - Monthly Overhead: ${session['data']['overhead_costs']}
            
            Consider and break down:
            - Initial inventory needs
            - Required equipment/facilities
            - Legal and registration fees
            - Initial marketing/launch costs
            - Security deposits
            - Working capital needs
            
            Provide detailed breakdown and end with FINAL SUGGESTION: $XX,XXX.XX"""
            
            ai_suggestion, debug_prompt = get_ai_suggestion(prompt)
            session['data']['ai_suggestions']['startup_costs'] = ai_suggestion
            session.modified = True
            return render_template('step6.html', ai_suggestion=ai_suggestion, debug_prompt=debug_prompt)
        
        session['data']['startup_costs'] = float(startup_costs)
        session.modified = True
        
        # Calculate break-even point and prepare data for summary
        data = session['data']
        fixed_costs = float(data['overhead_costs'])
        variable_costs = float(data['cost_of_goods'])
        price = float(data['price_range'])
        startup_costs = float(data['startup_costs'])
        
        try:
            if price <= variable_costs:
                break_even_units = float('inf')
                break_even_message = "Cannot calculate break-even point: Price per unit must be greater than variable costs per unit."
                show_chart = False
            else:
                # Calculate break-even including startup costs
                contribution_margin = price - variable_costs
                total_fixed_costs = fixed_costs + (startup_costs / 12)  # Amortize startup costs over 1 year
                break_even_units = total_fixed_costs / contribution_margin
                break_even_message = f"You need to sell {break_even_units:.2f} units per month to break even (including startup costs amortized over 1 year)."
                show_chart = True
        except Exception as e:
            break_even_units = 0
            break_even_message = f"Error calculating break-even point: {str(e)}"
            show_chart = False
        
        # Generate data points for chart (0 to 2x break-even point)
        if show_chart:
            max_units = int(break_even_units * 2)
            chart_data = {
                'labels': [i * (max_units // 10) for i in range(11)],
                'revenue': [(i * (max_units // 10)) * price for i in range(11)],
                'costs': [(i * (max_units // 10)) * variable_costs + fixed_costs + (startup_costs / 12) for i in range(11)]
            }
        else:
            chart_data = {'labels': [], 'revenue': [], 'costs': []}
        
        return render_template('summary.html',
                             data=data,
                             break_even_units=break_even_units,
                             break_even_message=break_even_message,
                             show_chart=show_chart,
                             chart_data=chart_data)
    
    return render_template('step6.html')

@app.route('/summary')
def summary():
    data = session['data']
    
    # Calculate break-even point
    fixed_costs = data['overhead_costs'] + data['marketing_budget']
    variable_costs = data['cost_of_goods']
    price = data['price_range']
    
    if price > variable_costs:
        break_even_units = fixed_costs / (price - variable_costs)
    else:
        break_even_units = float('inf')
    
    # Generate data points for chart
    chart_data = {
        'labels': [i * 100 for i in range(11)],  # 0 to 1000 units
        'revenue': [(i * 100) * price for i in range(11)],
        'costs': [(i * 100) * variable_costs + fixed_costs for i in range(11)]
    }
    
    return render_template('summary.html', 
                         data=data, 
                         break_even_units=break_even_units,
                         chart_data=chart_data)

if __name__ == '__main__':
    app.run(debug=True)
