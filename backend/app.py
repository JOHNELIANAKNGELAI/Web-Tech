from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
import json

app = Flask(__name__)
CORS(app)

db_path = os.path.join(os.path.dirname(__file__), '..', 'database', 'edulearn.db')

# Auto-initialize database on startup if missing (for Render)
if not os.path.exists(db_path):
    print("Database missing. Running setup_db.py...")
    import subprocess
    setup_script = os.path.join(os.path.dirname(__file__), '..', 'database', 'setup_db.py')
    subprocess.run(['python', setup_script])

def get_db_connection():
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

# --------- AUTH ---------
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({"success": False, "message": "Email and password required"}), 400
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE email = ? AND password = ?', (email, password)).fetchone()
    conn.close()
    if user:
        return jsonify({"success": True, "user": {"id": user['id'], "name": user['name'], "email": user['email']}})
    return jsonify({"success": False, "message": "Invalid credentials"}), 401

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    if not name or not email or not password:
        return jsonify({"success": False, "message": "All fields required"}), 400
    conn = get_db_connection()
    try:
        conn.execute('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', (name, email, password))
        conn.commit()
        success = True
    except sqlite3.IntegrityError:
        success = False
    finally:
        conn.close()
    return jsonify({"success": success, "message": "" if success else "Email already exists"}), 200 if success else 400

@app.route('/api/update_profile', methods=['POST'])
def update_profile():
    data = request.get_json()
    email = data.get('email')
    name = data.get('name')
    password = data.get('password')
    conn = get_db_connection()
    try:
        if password:
            conn.execute('UPDATE users SET name = ?, password = ? WHERE email = ?', (name, password, email))
        else:
            conn.execute('UPDATE users SET name = ? WHERE email = ?', (name, email))
        conn.commit()
        success = True
    except:
        success = False
    finally:
        conn.close()
    return jsonify({"success": success})

# --------- COURSES ---------
@app.route('/api/courses', methods=['GET'])
def get_courses():
    conn = get_db_connection()
    courses = conn.execute('SELECT * FROM courses').fetchall()
    conn.close()
    return jsonify([dict(c) for c in courses])

@app.route('/api/courses/<int:course_id>', methods=['GET'])
def get_course(course_id):
    conn = get_db_connection()
    course = conn.execute('SELECT * FROM courses WHERE id = ?', (course_id,)).fetchone()
    conn.close()
    if course:
        return jsonify(dict(course))
    return jsonify({"success": False, "message": "Course not found"}), 404

# --------- QUIZZES & GRADES ---------
@app.route('/api/quizzes/<int:course_id>', methods=['GET'])
def get_quizzes(course_id):
    conn = get_db_connection()
    quizzes = conn.execute('SELECT id, question, options FROM quizzes WHERE course_id = ?', (course_id,)).fetchall()
    conn.close()
    
    quiz_list = []
    for q in quizzes:
        q_dict = dict(q)
        try:
            q_dict['options'] = json.loads(q_dict['options'])
        except Exception:
            q_dict['options'] = []
        quiz_list.append(q_dict)
    
    return jsonify(quiz_list)

@app.route('/api/quizzes/submit', methods=['POST'])
def submit_quiz():
    data = request.get_json()
    user_id = data.get('user_id')
    course_id = data.get('course_id')
    answers = data.get('answers') # Expected dict: { quiz_id: "selected answer string" }
    
    if not user_id or not course_id or answers is None:
        return jsonify({"success": False, "message": "Missing fields"}), 400
        
    conn = get_db_connection()
    quizzes = conn.execute('SELECT id, answer FROM quizzes WHERE course_id = ?', (course_id,)).fetchall()
    
    score = 0
    total = len(quizzes)
    
    if total == 0:
        conn.close()
        return jsonify({"success": False, "message": "No quiz found for this course"}), 404
        
    correct_answers = {str(q['id']): q['answer'] for q in quizzes}
    
    for q_id, ans in answers.items():
        if correct_answers.get(str(q_id)) == ans:
            score += 1
            
    grade = (score / total) * 100
    
    conn.execute('''
        INSERT INTO grades (user_id, course_id, score, total, grade)
        VALUES (?, ?, ?, ?, ?)
    ''', (user_id, course_id, score, total, grade))
    
    # Increment student count for this course
    conn.execute('UPDATE courses SET students = students + 1 WHERE id = ?', (course_id,))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        "success": True,
        "score": score,
        "total": total,
        "grade": grade
    })

@app.route('/api/grades/<int:user_id>', methods=['GET'])
def get_grades(user_id):
    conn = get_db_connection()
    grades = conn.execute('''
        SELECT g.*, c.title as course_title 
        FROM grades g
        JOIN courses c ON g.course_id = c.id
        WHERE g.user_id = ?
        ORDER BY g.timestamp DESC
    ''', (user_id,)).fetchall()
    conn.close()
    return jsonify([dict(g) for g in grades])

# --------- FORUM ---------
@app.route('/api/forum', methods=['GET'])
def get_forum_posts():
    conn = get_db_connection()
    posts = conn.execute('''
        SELECT p.*, u.name as author 
        FROM forum_posts p 
        JOIN users u ON p.user_id = u.id 
        ORDER BY p.timestamp DESC
    ''').fetchall()
    conn.close()
    return jsonify([dict(p) for p in posts])

@app.route('/api/forum', methods=['POST'])
def create_forum_post():
    data = request.get_json()
    user_id = data.get('user_id')
    title = data.get('title')
    content = data.get('content')
    if not user_id or not title or not content:
        return jsonify({"success": False, "message": "Missing fields"}), 400
    conn = get_db_connection()
    conn.execute('INSERT INTO forum_posts (user_id, title, content) VALUES (?, ?, ?)', (user_id, title, content))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

@app.route('/api/forum/<int:post_id>', methods=['GET'])
def get_forum_post(post_id):
    conn = get_db_connection()
    post = conn.execute('SELECT p.*, u.name as author FROM forum_posts p JOIN users u ON p.user_id = u.id WHERE p.id = ?', (post_id,)).fetchone()
    if not post:
        return jsonify({"success": False, "message": "Post not found"}), 404
    replies = conn.execute('SELECT r.*, u.name as author FROM forum_replies r JOIN users u ON r.user_id = u.id WHERE r.post_id = ? ORDER BY r.timestamp ASC', (post_id,)).fetchall()
    conn.close()
    post_dict = dict(post)
    post_dict['replies'] = [dict(r) for r in replies]
    return jsonify(post_dict)

@app.route('/api/forum/<int:post_id>/reply', methods=['POST'])
def add_forum_reply(post_id):
    data = request.get_json()
    user_id = data.get('user_id')
    content = data.get('content')
    if not user_id or not content:
        return jsonify({"success": False, "message": "Missing fields"}), 400
    conn = get_db_connection()
    conn.execute('INSERT INTO forum_replies (post_id, user_id, content) VALUES (?, ?, ?)', (post_id, user_id, content))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

# --------- BOOKSTORE & MARKETPLACE ---------
@app.route('/api/books', methods=['GET'])
def get_books():
    user_id = request.args.get('user_id')
    conn = get_db_connection()
    books = conn.execute('''
        SELECT b.*, u.name as seller_name 
        FROM books b 
        JOIN users u ON b.seller_id = u.id
    ''').fetchall()
    
    purchased_ids = []
    if user_id:
        purchases = conn.execute('SELECT book_id FROM purchases WHERE user_id = ?', (user_id,)).fetchall()
        purchased_ids = [p['book_id'] for p in purchases]
    
    conn.close()
    
    book_list = []
    for b in books:
        b_dict = dict(b)
        b_dict['is_purchased'] = b_dict['id'] in purchased_ids or b_dict['price'] == 0
        if 'content' in b_dict:
            del b_dict['content'] # Hide content from main list
        book_list.append(b_dict)
    return jsonify(book_list)

@app.route('/api/books/<int:book_id>/content', methods=['GET'])
def get_book_content(book_id):
    user_id = request.args.get('user_id')
    conn = get_db_connection()
    book = conn.execute('SELECT * FROM books WHERE id = ?', (book_id,)).fetchone()
    
    if not book:
        conn.close()
        return jsonify({"success": False, "message": "Book not found"}), 404
        
    if book['price'] == 0:
        conn.close()
        return jsonify({"success": True, "content": book['content']})
        
    if user_id:
        purchase = conn.execute('SELECT 1 FROM purchases WHERE user_id = ? AND book_id = ?', (user_id, book_id)).fetchone()
        if purchase:
            conn.close()
            return jsonify({"success": True, "content": book['content']})
            
    conn.close()
    return jsonify({"success": False, "message": "Purchase required to read this book"}), 403

@app.route('/api/books', methods=['POST'])
def sell_book():
    data = request.get_json()
    seller_id = data.get('seller_id')
    title = data.get('title')
    price = data.get('price')
    category = data.get('category')
    content = data.get('content', 'Default book content for new listing...')
    image_url = data.get('image_url', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400')
    if not seller_id or not title or not price or not category:
        return jsonify({"success": False, "message": "Missing fields"}), 400
    conn = get_db_connection()
    conn.execute('INSERT INTO books (seller_id, title, price, category, image_url, content) VALUES (?, ?, ?, ?, ?, ?)', (seller_id, title, price, category, image_url, content))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

@app.route('/api/purchase', methods=['POST'])
def make_purchase():
    data = request.get_json()
    user_id = data.get('user_id')
    book_ids = data.get('book_ids', [])
    if not user_id or not book_ids:
        return jsonify({"success": False, "message": "Missing fields"}), 400
    conn = get_db_connection()
    for book_id in book_ids:
        conn.execute('INSERT INTO purchases (user_id, book_id) VALUES (?, ?)', (user_id, book_id))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

@app.route('/api/purchases/<int:user_id>', methods=['GET'])
def get_purchases(user_id):
    conn = get_db_connection()
    purchases = conn.execute('''
        SELECT p.timestamp, b.title, b.price, b.image_url, b.id as book_id
        FROM purchases p 
        JOIN books b ON p.book_id = b.id 
        WHERE p.user_id = ? 
        ORDER BY p.timestamp DESC
    ''', (user_id,)).fetchall()
    conn.close()
    return jsonify([dict(p) for p in purchases])

@app.route('/api/delete_book', methods=['POST'])
def delete_book():
    data = request.get_json()
    book_id = data.get('book_id')
    seller_id = data.get('seller_id')
    if not book_id or not seller_id:
        return jsonify({"success": False}), 400
    conn = get_db_connection()
    conn.execute('DELETE FROM books WHERE id = ? AND seller_id = ?', (book_id, seller_id))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

if __name__ == '__main__':
    import os
    port = int(os.environ.get("PORT", 5000))
    print(f"Starting EduLearn Backend Server on port {port}...")
    app.run(host='0.0.0.0', port=port)
