import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'edulearn.db')

conn = sqlite3.connect(db_path)
c = conn.cursor()

# Drop existing tables to recreate clean schema
tables = ['users', 'courses', 'forum_posts', 'forum_replies', 'books', 'purchases', 'quizzes', 'grades']
for table in tables:
    c.execute(f'DROP TABLE IF EXISTS {table}')

c.execute('''CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
)''')

c.execute('''CREATE TABLE courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    instructor TEXT NOT NULL,
    category TEXT NOT NULL,
    students INTEGER DEFAULT 0,
    weeks INTEGER DEFAULT 12,
    image_icon TEXT DEFAULT '📘',
    video_url TEXT DEFAULT 'videos/cs_intro.mp4',
    notes TEXT DEFAULT ''
)''')

c.execute('''CREATE TABLE quizzes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER,
    question TEXT NOT NULL,
    options TEXT NOT NULL,
    answer TEXT NOT NULL,
    FOREIGN KEY(course_id) REFERENCES courses(id)
)''')

c.execute('''CREATE TABLE grades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    course_id INTEGER,
    score INTEGER,
    total INTEGER,
    grade REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(course_id) REFERENCES courses(id)
)''')

c.execute('''CREATE TABLE forum_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
)''')

c.execute('''CREATE TABLE forum_replies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER,
    user_id INTEGER,
    content TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(post_id) REFERENCES forum_posts(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
)''')

c.execute('''CREATE TABLE books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    seller_id INTEGER,
    title TEXT NOT NULL,
    price REAL NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT,
    content TEXT,
    FOREIGN KEY(seller_id) REFERENCES users(id)
)''')

c.execute('''CREATE TABLE purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    book_id INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(book_id) REFERENCES books(id)
)''')

c.execute('''CREATE TABLE saved_courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    course_id INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(course_id) REFERENCES courses(id),
    UNIQUE(user_id, course_id)
)''')

# Insert dummy data
c.execute("INSERT INTO users (name, email, password) VALUES ('Admin User', 'admin@edulearn.com', '123456')")
admin_id = c.lastrowid
c.execute("INSERT INTO users (name, email, password) VALUES ('Student One', 'student@edulearn.com', '123456')")
student_id = c.lastrowid

# Courses
cs_notes = """
<h2 style="color: var(--primary-blue);">1. What is Computer Science?</h2>
<p>Computer science is fundamentally about problem-solving. It is the study of algorithms, data representation, and the hardware that executes them.</p>

<h2 style="color: var(--primary-blue);">2. Data Representation (Binary)</h2>
<p>Computers only understand two states: On and Off. This is represented using the binary number system (0s and 1s). A single 0 or 1 is called a <strong>bit</strong> (binary digit).</p>
<ul>
  <li><strong>1 Byte:</strong> 8 bits grouped together.</li>
  <li><strong>ASCII standard:</strong> A standard that maps numbers to characters.</li>
</ul>

<h2 style="color: var(--primary-blue);">3. Core Architecture</h2>
<p>The <strong>CPU (Central Processing Unit)</strong> is the brain of the computer. Its <strong>ALU (Arithmetic Logic Unit)</strong> performs arithmetic and logic operations. Memory comes in volatile forms (like RAM, which loses data when powered off) and non-volatile forms (like ROM or Hard Disks).</p>
<p>Charles Babbage is widely considered the father of computers. For connecting networks together, a Router is typically used, utilizing the Internet Protocol (IP).</p>
"""

calc_notes = """
<h2 style="color: var(--primary-blue);">1. Derivatives & Rules</h2>
<p>A derivative measures the rate of change. For example, the derivative of a constant is always <strong>0</strong>. The derivative of x^2 is <strong>2x</strong>.</p>
<ul>
  <li><strong>Product Rule:</strong> f'g + fg'</li>
  <li><strong>Chain Rule:</strong> Used for differentiating composite functions.</li>
  <li><strong>Trigonometry:</strong> The derivative of sin(x) is cos(x).</li>
  <li><strong>Logarithms:</strong> The derivative of ln(x) is 1/x.</li>
</ul>

<h2 style="color: var(--primary-blue);">2. Integrals</h2>
<p>Integration is the reverse of differentiation. The integral of 2x is x^2 + C. The integral of e^x is e^x + C.</p>
<p><strong>Isaac Newton</strong> is co-credited (along with Leibniz) for inventing calculus.</p>
"""

hist_notes = """
<h2 style="color: var(--primary-blue);">1. Ancient Civilizations</h2>
<p>The <strong>Egyptians</strong> are famous for building the pyramids. In Asia, the <strong>Great Wall</strong> was built primarily to protect <strong>China</strong> from invasions. The <strong>Roman Empire</strong> was famously ruled by Julius Caesar.</p>

<h2 style="color: var(--primary-blue);">2. The Renaissance and Early America</h2>
<p>During the Renaissance, <strong>Leonardo da Vinci</strong> painted the masterpiece, the Mona Lisa. Later, the Pilgrims traveled to America on a ship called the <strong>Mayflower</strong>. <strong>George Washington</strong> became the first President of the United States. The French Revolution began shortly after in <strong>1789</strong>.</p>

<h2 style="color: var(--primary-blue);">3. 20th Century</h2>
<p>Alexander Fleming changed medicine by discovering <strong>penicillin</strong>. World War II officially ended in <strong>1945</strong>. This was followed by the Cold War, primarily a rivalry between the <strong>USA and USSR</strong>.</p>
"""

web_notes = """
<h2 style="color: var(--primary-blue);">1. HTML Fundamentals</h2>
<p>HTML stands for <strong>Hyper Text Markup Language</strong>. The Document Object Model (<strong>DOM</strong>) represents the page so programs can change the document structure. To add a comment in HTML, use <strong>&lt;!-- comment --&gt;</strong>.</p>
<ul>
  <li><strong>&lt;h1&gt;:</strong> Used for the largest heading.</li>
  <li><strong>&lt;a&gt;:</strong> Creates a hyperlink.</li>
  <li><strong>&lt;style&gt;:</strong> Defines an internal style sheet.</li>
</ul>

<h2 style="color: var(--primary-blue);">2. CSS & JavaScript</h2>
<p><strong>CSS (Cascading Style Sheets)</strong> styles the page. To change the background color, use the <strong>background-color</strong> property. A popular CSS framework is <strong>Bootstrap</strong>.</p>
<p>In JavaScript, you can declare variables with <strong>var carName;</strong>. To add an element to the end of an array, use the <strong>push()</strong> method.</p>
"""

courses = [
    ('Introduction to Computer Science', 'Dr. Sarah Johnson', 'Computer Science', 0, 12, '💻', 'videos/cs_intro.mp4', cs_notes),
    ('Advanced Calculus', 'Prof. Michael Chen', 'Mathematics', 0, 14, '📐', 'videos/calculus.mp4', calc_notes),
    ('World History', 'Dr. Emily Brown', 'History', 0, 10, '🌍', 'videos/history.mp4', hist_notes),
    ('Web Development Bootcamp', 'John Doe', 'Computer Science', 0, 8, '🌐', 'videos/cs_intro.mp4', web_notes)
]
c.executemany("INSERT INTO courses (title, instructor, category, students, weeks, image_icon, video_url, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", courses)

# Quizzes for Introduction to Computer Science (course_id = 1)
cs_quizzes = [
    (1, "What does CPU stand for?", "[\"Central Process Unit\", \"Computer Personal Unit\", \"Central Processing Unit\", \"Central Processor Unit\"]", "Central Processing Unit"),
    (1, "Which of the following is not an operating system?", "[\"Windows\", \"Linux\", \"Oracle\", \"macOS\"]", "Oracle"),
    (1, "What does HTML stand for?", "[\"Hyper Text Markup Language\", \"High Text Markup Language\", \"Hyper Tabular Markup Language\", \"None of these\"]", "Hyper Text Markup Language"),
    (1, "Which is a volatile memory?", "[\"ROM\", \"RAM\", \"Hard Disk\", \"CD\"]", "RAM"),
    (1, "Who is the father of Computers?", "[\"Charles Babbage\", \"Alan Turing\", \"John von Neumann\", \"Dennis Ritchie\"]", "Charles Babbage"),
    (1, "A byte consists of how many bits?", "[\"4 bits\", \"8 bits\", \"16 bits\", \"32 bits\"]", "8 bits"),
    (1, "Which language is primarily used for web development alongside HTML and CSS?", "[\"Python\", \"C++\", \"JavaScript\", \"Java\"]", "JavaScript"),
    (1, "What is the main function of the ALU?", "[\"Store data\", \"Perform arithmetic and logic operations\", \"Control computer operations\", \"Manage memory\"]", "Perform arithmetic and logic operations"),
    (1, "What does IP stand for?", "[\"Internet Provider\", \"Internet Protocol\", \"Internal Protocol\", \"International Protocol\"]", "Internet Protocol"),
    (1, "Which device is used to connect multiple networks?", "[\"Hub\", \"Switch\", \"Router\", \"Modem\"]", "Router")
]
c.executemany("INSERT INTO quizzes (course_id, question, options, answer) VALUES (?, ?, ?, ?)", cs_quizzes)

# Quizzes for Advanced Calculus (course_id = 2)
calc_quizzes = [
    (2, "What is the derivative of x^2?", "[\"x\", \"2x\", \"x^2\", \"2\"]", "2x"),
    (2, "What is the integral of 2x?", "[\"x^2 + C\", \"x^2\", \"2x^2 + C\", \"x\"]", "x^2 + C"),
    (2, "What is the derivative of sin(x)?", "[\"-sin(x)\", \"cos(x)\", \"-cos(x)\", \"sec^2(x)\"]", "cos(x)"),
    (2, "What does the limit as x approaches 0 of sin(x)/x equal?", "[\"0\", \"1\", \"Infinity\", \"Undefined\"]", "1"),
    (2, "What is the product rule?", "[\"f'g + fg'\", \"f'g - fg'\", \"f'g'\", \"f/g\"]", "f'g + fg'"),
    (2, "What is the integral of e^x?", "[\"e^x + C\", \"xe^{x-1}\", \"ln(x)\", \"1/e^x\"]", "e^x + C"),
    (2, "What is the derivative of ln(x)?", "[\"1/x\", \"x\", \"e^x\", \"ln(x)\"]", "1/x"),
    (2, "What is the chain rule used for?", "[\"Adding functions\", \"Multiplying functions\", \"Differentiating composite functions\", \"Integrating functions\"]", "Differentiating composite functions"),
    (2, "What is the derivative of a constant?", "[\"The constant itself\", \"1\", \"0\", \"Undefined\"]", "0"),
    (2, "Which mathematician is co-credited with inventing calculus?", "[\"Isaac Newton\", \"Albert Einstein\", \"Euclid\", \"Pythagoras\"]", "Isaac Newton")
]
c.executemany("INSERT INTO quizzes (course_id, question, options, answer) VALUES (?, ?, ?, ?)", calc_quizzes)

# Quizzes for World History (course_id = 3)
hist_quizzes = [
    (3, "In which year did World War II end?", "[\"1940\", \"1942\", \"1945\", \"1950\"]", "1945"),
    (3, "Who was the first President of the United States?", "[\"Thomas Jefferson\", \"Abraham Lincoln\", \"George Washington\", \"John Adams\"]", "George Washington"),
    (3, "The Great Wall was built primarily to protect which country?", "[\"Japan\", \"China\", \"Mongolia\", \"India\"]", "China"),
    (3, "Which ancient civilization built the pyramids?", "[\"Romans\", \"Greeks\", \"Mayans\", \"Egyptians\"]", "Egyptians"),
    (3, "Who painted the Mona Lisa?", "[\"Vincent van Gogh\", \"Pablo Picasso\", \"Leonardo da Vinci\", \"Michelangelo\"]", "Leonardo da Vinci"),
    (3, "What was the name of the ship that brought the Pilgrims to America?", "[\"Santa Maria\", \"Mayflower\", \"Endeavour\", \"Discovery\"]", "Mayflower"),
    (3, "The French Revolution began in which year?", "[\"1776\", \"1789\", \"1804\", \"1812\"]", "1789"),
    (3, "Which empire was ruled by Julius Caesar?", "[\"Ottoman Empire\", \"Mongol Empire\", \"Roman Empire\", \"British Empire\"]", "Roman Empire"),
    (3, "Who discovered penicillin?", "[\"Marie Curie\", \"Alexander Fleming\", \"Louis Pasteur\", \"Isaac Newton\"]", "Alexander Fleming"),
    (3, "The Cold War was primarily a rivalry between which two superpowers?", "[\"USA and UK\", \"USA and USSR\", \"Germany and France\", \"China and Japan\"]", "USA and USSR")
]
c.executemany("INSERT INTO quizzes (course_id, question, options, answer) VALUES (?, ?, ?, ?)", hist_quizzes)

# Quizzes for Web Development Bootcamp (course_id = 4)
web_quizzes = [
    (4, "What does CSS stand for?", "[\"Cascading Style Sheets\", \"Computer Style Sheets\", \"Creative Style Sheets\", \"Colorful Style Sheets\"]", "Cascading Style Sheets"),
    (4, "Which HTML tag is used to define an internal style sheet?", "[\"&lt;script&gt;\", \"&lt;style&gt;\", \"&lt;css&gt;\", \"&lt;link&gt;\"]", "&lt;style&gt;"),
    (4, "Which property is used to change the background color?", "[\"color\", \"bgcolor\", \"background-color\", \"bg-color\"]", "background-color"),
    (4, "How do you add a comment in HTML?", "[\"// comment\", \"/* comment */\", \"&lt;!-- comment --&gt;\", \"# comment\"]", "&lt;!-- comment --&gt;"),
    (4, "Which of the following is a CSS framework?", "[\"React\", \"Django\", \"Bootstrap\", \"Angular\"]", "Bootstrap"),
    (4, "What does the &lt;a&gt; tag do?", "[\"Adds an image\", \"Creates a hyperlink\", \"Bolds text\", \"Creates a list\"]", "Creates a hyperlink"),
    (4, "Which built-in method adds one or more elements to the end of an array and returns the new length?", "[\"last()\", \"put()\", \"push()\", \"pop()\"]", "push()"),
    (4, "How do you declare a JavaScript variable?", "[\"variable carName;\", \"v carName;\", \"var carName;\", \"val carName;\"]", "var carName;"),
    (4, "Which HTML element is used for the largest heading?", "[\"&lt;heading&gt;\", \"&lt;h6&gt;\", \"&lt;h1&gt;\", \"&lt;head&gt;\"]", "&lt;h1&gt;"),
    (4, "What does DOM stand for?", "[\"Document Object Model\", \"Data Object Model\", \"Document Oriented Model\", \"Data Oriented Model\"]", "Document Object Model")
]
c.executemany("INSERT INTO quizzes (course_id, question, options, answer) VALUES (?, ?, ?, ?)", web_quizzes)

# Books
books = [
    (admin_id, 'Mastering Java (Free Edition)', 0.00, 'Programming', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400', 'Java is a versatile language used in billions of devices worldwide. This guide covers the basics of object-oriented programming. You will learn about classes, objects, and inheritance patterns. Understanding memory management is key to writing efficient Java code. We explore the Java Collections Framework for data handling. Exception handling ensures your applications are robust and reliable. Multithreading allows for concurrent execution in your programs. File I/O is essential for data persistence in Java. We also touch upon networking for building connected systems. This book provides a solid foundation for your Java journey.'),
    (admin_id, 'Web Dev Basics (Free)', 0.00, 'Programming', 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?q=80&w=400', 'The web is built on three main pillars: HTML, CSS, and JS. HTML provides the structure of your web pages. CSS is responsible for the visual styling and layout. JavaScript adds interactivity and dynamic behavior to the site. Understanding the DOM is crucial for frontend development. Responsive design ensures your site looks great on all devices. Modern frameworks like React and Vue simplify complex UIs. Backend development handles data storage and server-side logic. APIs allow different systems to communicate over the web. Mastering these tools opens doors to countless career opportunities.'),
    (admin_id, 'Modern Psychology', 25.00, 'Science', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=400', 'Psychology is the scientific study of the mind and behavior. It explores how we think, feel, and interact with others. Cognitive psychology focuses on mental processes like memory and perception. Behavioral psychology examines how environment shapes our actions. Developmental psychology tracks changes from childhood to adulthood. Social psychology looks at group dynamics and social influence. Understanding psychological theories helps us improve our daily lives. Research methods are used to gather and analyze data. Clinical psychology focuses on diagnosing and treating mental health issues. This field continues to evolve with new neurological discoveries.'),
    (student_id, 'Advanced Calculus', 85.50, 'Mathematics', 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?q=80&w=400', 'Calculus is the mathematical study of continuous change. It consists of two main branches: differential and integral. Limits are the fundamental building blocks of all calculus. Derivatives help us understand the rate of change of functions. Integrals allow us to calculate areas under curves and volumes. The Fundamental Theorem of Calculus links these two concepts. Multivariable calculus extends these ideas to higher dimensions. Differential equations are used to model real-world phenomena. Series and sequences help us approximate complex functions. Mastering calculus is essential for science and engineering fields.'),
    (admin_id, 'World History 101', 15.99, 'History', 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?q=80&w=400', 'History is the study of the past through written records. It helps us understand how civilizations rose and fell. Ancient empires laid the groundwork for modern societies. The Renaissance brought a rebirth of art and science. Industrial revolutions transformed the way we live and work. Global conflicts have shaped current political boundaries. Cultural exchange has led to a more connected world. Studying history allows us to learn from past mistakes. It provides perspective on current events and future trends. Knowledge of history is vital for an informed citizenship.')
]
c.executemany("INSERT INTO books (seller_id, title, price, category, image_url, content) VALUES (?, ?, ?, ?, ?, ?)", books)

# Forum
c.execute("INSERT INTO forum_posts (user_id, title, content) VALUES (?, ?, ?)", (student_id, 'Help with Assignment 2', 'I am stuck on the second part of the web tech assignment. Any tips?'))
post_id = c.lastrowid
c.execute("INSERT INTO forum_replies (post_id, user_id, content) VALUES (?, ?, ?)", (post_id, admin_id, 'Make sure you read the documentation carefully!'))

conn.commit()
print("Database initialized successfully.")
conn.close()
