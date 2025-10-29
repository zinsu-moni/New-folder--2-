"""
Add mobile styles to all admin pages
"""
import re

# The mobile CSS to add
mobile_css = """
        /* Mobile Menu Toggle */
        .mobile-menu-toggle {
            display: none;
            position: fixed;
            top: 15px;
            left: 15px;
            z-index: 1001;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 15px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 20px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .mobile-overlay {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
        }

        .mobile-overlay.active {
            display: block;
        }

        @media (max-width: 768px) {
            .sidebar {
                position: fixed;
                left: -100%;
                top: 0;
                width: 80%;
                max-width: 300px;
                height: 100vh;
                z-index: 1000;
                transition: left 0.3s ease;
                box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3);
            }

            .sidebar.active {
                left: 0;
            }

            .mobile-menu-toggle {
                display: block;
            }

            .main-content {
                margin-left: 0;
                padding: 70px 15px 15px;
                width: 100%;
            }

            .header {
                flex-direction: column;
                align-items: flex-start;
                gap: 15px;
            }

            .header h1 {
                font-size: 24px;
            }

            .filters {
                flex-direction: column;
                width: 100%;
            }

            .filters select, .filters input {
                width: 100%;
            }

            .content-section {
                padding: 15px;
                overflow-x: auto;
            }

            table {
                min-width: 600px;
            }

            table th, table td {
                padding: 10px 8px;
                font-size: 13px;
            }

            .action-btns {
                flex-direction: column;
                gap: 5px;
            }

            .btn-small, .btn {
                width: 100%;
            }
        }

        @media (max-width: 480px) {
            .main-content {
                padding: 60px 10px 10px;
            }

            .header h1 {
                font-size: 20px;
            }

            table {
                min-width: 500px;
            }

            table th, table td {
                padding: 8px 6px;
                font-size: 12px;
            }
        }
"""

# List of admin files to update
admin_files = [
    'admin-withdrawals.html',
    'admin-cards.html',
    'admin-articles.html',
    'admin-announcements.html',
    'admin-logs.html',
    'admin-dashboard.html'
]

for filename in admin_files:
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Remove admin-mobile.css link if present
        content = re.sub(r'\s*<link rel="stylesheet" href="css/admin-mobile\.css">', '', content)
        
        # Check if mobile styles already exist
        if '@media (max-width: 768px)' in content:
            print(f'✓ {filename} already has mobile styles')
            continue
        
        # Find the last </style> before </head>
        style_end = content.rfind('</style>')
        if style_end == -1:
            print(f'✗ {filename} - No </style> tag found')
            continue
        
        # Insert mobile CSS before </style>
        new_content = content[:style_end] + mobile_css + content[style_end:]
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f'✓ {filename} updated successfully')
    
    except Exception as e:
        print(f'✗ {filename} - Error: {e}')

print('\nDone!')
