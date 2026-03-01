import sqlite3
import os

# Define Project Root (Grandparent of this script)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def get_db_path(db_name):
    return os.path.join(BASE_DIR, db_name)

def init_db(reset=False):
    """
    UData.db, User.db, chatroom.db, chatlog.db, task.db
    Initialize tables if they don't exist.
    """
    print(f"Database Initialization Target: {BASE_DIR}")
    
    # DB Connections
    User = sqlite3.connect(get_db_path('User.db'))
    UData = sqlite3.connect(get_db_path('UData.db'))
    chatroom = sqlite3.connect(get_db_path('chatroom.db'))
    chatlog = sqlite3.connect(get_db_path('chatlog.db'))
    task = sqlite3.connect(get_db_path('task.db'))

    Usercursor = User.cursor()
    UDatacursor = UData.cursor()
    chatroomcur = chatroom.cursor()
    chatlogcur = chatlog.cursor()
    taskcur = task.cursor()

    if reset:
        print("⚠️  Warning: Reset option is ON. Dropping existing tables...")
        Usercursor.execute("DROP TABLE IF EXISTS User")
        UDatacursor.execute("DROP TABLE IF EXISTS UData")
        chatroomcur.execute("DROP TABLE IF EXISTS chatroom")
        chatlogcur.execute("DROP TABLE IF EXISTS chatlog")
        taskcur.execute("DROP TABLE IF EXISTS task")
        taskcur.execute("DROP TABLE IF EXISTS action_log")
        taskcur.execute("DROP TABLE IF EXISTS task_extraction_log")

    print("Checking and creating tables...")

    # User Schema
    Usercursor.execute('''CREATE TABLE IF NOT EXISTS User (
        ID INTEGER PRIMARY KEY, 
        Gender TEXT, 
        age INTEGER, 
        job TEXT, 
        MBTI TEXT, 
        email TEXT, 
        keywords TEXT
    )''')

    # UData Schema (Auth)
    UDatacursor.execute('''CREATE TABLE IF NOT EXISTS UData (
        ID INTEGER PRIMARY KEY AUTOINCREMENT, 
        Personalist TEXT, 
        Persona TEXT, 
        User_ID TEXT UNIQUE, 
        PASSWORD TEXT
    )''')

    # Chatroom Schema
    chatroomcur.execute('''CREATE TABLE IF NOT EXISTS chatroom (
        ID INTEGER PRIMARY KEY, 
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
        User_ID TEXT UNIQUE
    )''')

    # Chatlog Schema
    chatlogcur.execute('''CREATE TABLE IF NOT EXISTS chatlog (
        ID INTEGER PRIMARY KEY AUTOINCREMENT, 
        User_ID TEXT, 
        speaker TEXT, 
        message TEXT, 
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )''')

    # Task Schema
    taskcur.execute('''CREATE TABLE IF NOT EXISTS task (
        ID INTEGER PRIMARY KEY AUTOINCREMENT, 
        User_ID TEXT NOT NULL, 
        title TEXT NOT NULL, 
        todo TEXT, 
        date TEXT, 
        time TEXT, 
        priority TEXT DEFAULT 'medium', 
        status TEXT DEFAULT '대기', 
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
        updated_at DATETIME, 
        extracted_from_chat INTEGER DEFAULT 0
    )''')

    # Action Log Schema
    taskcur.execute('''CREATE TABLE IF NOT EXISTS action_log (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        Task_ID INTEGER NOT NULL,
        User_ID TEXT NOT NULL,
        action TEXT NOT NULL,
        old_value TEXT,
        new_value TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )''')

    # Task Extraction Log Schema
    taskcur.execute('''CREATE TABLE IF NOT EXISTS task_extraction_log (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        Task_ID INTEGER NOT NULL,
        User_ID TEXT NOT NULL,
        user_message_id INTEGER,
        ai_message_id INTEGER,
        user_message TEXT,
        ai_response TEXT,
        extraction_context TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )''')

    User.commit()
    UData.commit()
    chatroom.commit()
    chatlog.commit()
    task.commit()

    User.close()
    UData.close()
    chatroom.close()
    chatlog.close()
    task.close()

    print("✅ 데이터베이스 초기화 완료!")
    print(f"파일 위치: {BASE_DIR}")

if __name__ == "__main__":
    # If run directly, run initialization (safe mode by default)
    # Change reset=True if you want to wipe data
    init_db(reset=False)
