import sqlite3
import os
import sys
import io

# Set UTF-8 encoding for Windows console output
sys.stdout = io.TextIOWrapper(sys.stdout.detach(), encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.detach(), encoding='utf-8')

# Define database file paths (located in the project root: up 3 levels)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DB_FILES = {
    'User.db': os.path.join(BASE_DIR, 'User.db'),
    'UData.db': os.path.join(BASE_DIR, 'UData.db'),
    'chatroom.db': os.path.join(BASE_DIR, 'chatroom.db'),
    'chatlog.db': os.path.join(BASE_DIR, 'chatlog.db'),
    'task.db': os.path.join(BASE_DIR, 'task.db')
}

def delete_all_data():
    """
    Deletes all data from the databases while keeping the table structures intact.
    """
    print("=" * 50)
    print("데이터베이스 데이터 삭제 도구 (Database Cleanup Tool)")
    print("=" * 50)
    print("\n⚠️  경고: 이 작업은 되돌릴 수 없습니다! (Warning: This action cannot be undone!)")
    print("다음 데이터베이스의 모든 데이터가 삭제됩니다:")
    
    existing_dbs = []
    for name, path in DB_FILES.items():
        if os.path.exists(path):
            print(f"  - {name}")
            existing_dbs.append((name, path))
        else:
            print(f"  - {name} (파일 없음 - User will be skipped)")

    if not existing_dbs:
        print("\n❌ 삭제할 데이터베이스 파일이 존재하지 않습니다.")
        return

    # User confirmation
    confirm = input("\n정말로 모든 데이터를 삭제하시겠습니까? (yes/no): ").strip().lower()
    
    if confirm != 'yes':
        print("\n❌ 작업이 취소되었습니다.")
        return
    
    print("\n🗑️  데이터 삭제 중...\n")
    
    deleted_count = 0
    
    # Iterate over available databases and delete data
    for name, path in existing_dbs:
        try:
            conn = sqlite3.connect(path)
            cursor = conn.cursor()
            
            # Get list of tables to clear
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name != 'sqlite_sequence'")
            tables = cursor.fetchall()
            
            file_deleted_count = 0
            for table in tables:
                table_name = table[0]
                try:
                    cursor.execute(f"DELETE FROM {table_name}")
                    rows = cursor.rowcount
                    file_deleted_count += rows
                    # print(f"    - {table_name}: {rows} rows deleted") # Detailed log
                except Exception as table_error:
                     print(f"    ⚠️ {table_name} 삭제 실패: {table_error}")

            conn.commit()
            conn.close()
            print(f"✅ {name}: 총 {file_deleted_count}개 레코드 삭제 완료")
            deleted_count += file_deleted_count
            
        except Exception as e:
            print(f"❌ {name} 처리 중 오류 발생: {e}")

    print("\n" + "=" * 50)
    print(f"🎉 완료! 총 {deleted_count}개의 레코드가 삭제되었습니다.")
    print("=" * 50)
    print("\n💡 참고: 데이터베이스 파일 자체는 삭제되지 않았습니다.")
    print("   테이블 구조는 그대로 유지되며, 데이터만 삭제되었습니다.")

def show_data_count():
    """
    Displays the current number of records in each database.
    """
    print("\n📊 현재 데이터베이스 상태:")
    print("-" * 50)
    
    for name, path in DB_FILES.items():
        if os.path.exists(path):
            try:
                conn = sqlite3.connect(path)
                cursor = conn.cursor()
                
                # Get all tables
                cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name != 'sqlite_sequence'")
                tables = cursor.fetchall()
                
                info_text = []
                total_rows = 0
                for table in tables:
                    table_name = table[0]
                    cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
                    count = cursor.fetchone()[0]
                    info_text.append(f"{table_name}: {count}")
                    total_rows += count
                
                conn.close()
                
                # Format output
                info_str = ", ".join(info_text) if info_text else "테이블 없음"
                print(f"  {name}: {info_str}")
                
            except Exception as e:
                print(f"  {name}: 조회 실패 ({e})")
        else:
            print(f"  {name}: 파일 없음")
    
    print("-" * 50)

if __name__ == "__main__":
    # Display current data counts
    show_data_count()
    
    # Execute deletion process
    delete_all_data()
    
    # Display data counts after deletion
    show_data_count()
