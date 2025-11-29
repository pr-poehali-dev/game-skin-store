import json
import os
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def generate_session_token() -> str:
    return secrets.token_urlsafe(32)

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: User authentication - registration and login
    Args: event with httpMethod (POST), body with action, username, email, password
    Returns: HTTP response with user data and session token
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Session-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    action = body_data.get('action')
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if action == 'register':
        username = body_data.get('username')
        email = body_data.get('email')
        password = body_data.get('password')
        
        if not username or not email or not password:
            conn.close()
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Missing required fields'}),
                'isBase64Encoded': False
            }
        
        cursor.execute(
            "SELECT id FROM users WHERE username = %s OR email = %s",
            (username, email)
        )
        existing_user = cursor.fetchone()
        
        if existing_user:
            conn.close()
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Username or email already exists'}),
                'isBase64Encoded': False
            }
        
        password_hash = hash_password(password)
        
        cursor.execute(
            "INSERT INTO users (username, email, password_hash, balance) VALUES (%s, %s, %s, 1000.00) RETURNING id, username, email, balance",
            (username, email, password_hash)
        )
        user = cursor.fetchone()
        conn.commit()
        
        session_token = generate_session_token()
        expires_at = datetime.now() + timedelta(days=7)
        
        cursor.execute(
            "INSERT INTO user_sessions (user_id, session_token, expires_at) VALUES (%s, %s, %s)",
            (user['id'], session_token, expires_at)
        )
        conn.commit()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'user': {
                    'id': user['id'],
                    'username': user['username'],
                    'email': user['email'],
                    'balance': float(user['balance'])
                },
                'sessionToken': session_token
            }),
            'isBase64Encoded': False
        }
    
    elif action == 'login':
        username = body_data.get('username')
        password = body_data.get('password')
        
        if not username or not password:
            conn.close()
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Missing username or password'}),
                'isBase64Encoded': False
            }
        
        password_hash = hash_password(password)
        
        cursor.execute(
            "SELECT id, username, email, balance FROM users WHERE username = %s AND password_hash = %s",
            (username, password_hash)
        )
        user = cursor.fetchone()
        
        if not user:
            conn.close()
            return {
                'statusCode': 401,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Invalid credentials'}),
                'isBase64Encoded': False
            }
        
        session_token = generate_session_token()
        expires_at = datetime.now() + timedelta(days=7)
        
        cursor.execute(
            "INSERT INTO user_sessions (user_id, session_token, expires_at) VALUES (%s, %s, %s)",
            (user['id'], session_token, expires_at)
        )
        conn.commit()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'user': {
                    'id': user['id'],
                    'username': user['username'],
                    'email': user['email'],
                    'balance': float(user['balance'])
                },
                'sessionToken': session_token
            }),
            'isBase64Encoded': False
        }
    
    elif action == 'verify':
        session_token = body_data.get('sessionToken')
        
        if not session_token:
            conn.close()
            return {
                'statusCode': 401,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'No session token provided'}),
                'isBase64Encoded': False
            }
        
        cursor.execute(
            """
            SELECT u.id, u.username, u.email, u.balance 
            FROM users u 
            JOIN user_sessions s ON u.id = s.user_id 
            WHERE s.session_token = %s AND s.expires_at > NOW()
            """,
            (session_token,)
        )
        user = cursor.fetchone()
        conn.close()
        
        if not user:
            return {
                'statusCode': 401,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Invalid or expired session'}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'user': {
                    'id': user['id'],
                    'username': user['username'],
                    'email': user['email'],
                    'balance': float(user['balance'])
                }
            }),
            'isBase64Encoded': False
        }
    
    conn.close()
    return {
        'statusCode': 400,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Invalid action'}),
        'isBase64Encoded': False
    }
