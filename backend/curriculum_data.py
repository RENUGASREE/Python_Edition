CURRICULUM_DATA = [
    {
        "module_id": 19, # Python Fundamentals
        "topics": [
            {
                "title": "Python Intro",
                "beginner": {
                    "content": " BEGINNER LEVEL\n\n Definition\nPython is a popular programming language that is easy to read and write.\n\n Explanation\nThink of Python as a robot that follows your instructions. You use it to tell a computer what to do.\n\n Syntax\nprint('Hello World')\n\n Example\nprint('Welcome to Python!')\n\n Use Case\nBuilding simple calculators or welcome messages.\n\n Key Takeaways\n- Python is beginner-friendly.\n- Uses simple English-like syntax.\n\n Challenge\nWrite a program that prints your name.",
                    "challenge": {
                        "title": "My First Hello",
                        "description": "Write a Python script to print the message 'Python is Awesome!'",
                        "initial_code": "# Write your code here",
                        "solution_code": "print('Python is Awesome!')",
                        "test_cases": [{"input": "", "expected": "Python is Awesome!"}]
                    }
                },
                "intermediate": {
                    "content": " INTERMEDIATE LEVEL\n\n Definition\nPython is an interpreted, high-level, general-purpose programming language with dynamic typing and garbage collection.\n\n Explanation\nPython handles memory management for you. It's 'interpreted', meaning you don't need to compile it before running.\n\n Syntax\nimport sys\nprint(sys.version)\n\n Example\nx = 10\ny = 20\nprint(f'Sum: {x+y}')\n\n Use Case\nScripting tasks once done manually, like renaming 100 files at once.\n\n Challenge\nAssign two numbers to variables, add them, and print the result with a label.",
                    "challenge": {
                        "title": "Variable Addition",
                        "description": "Create two variables a=5 and b=10, then print 'The sum is 15'",
                        "initial_code": "a = 5\nb = 10\n# Calc sum and print",
                        "solution_code": "a = 5\nb = 10\nprint(f'The sum is {a+b}')",
                        "test_cases": [{"input": "", "expected": "The sum is 15"}]
                    }
                },
                "pro": {
                    "content": " PRO LEVEL\n\n Definition\nPython is a multi-paradigm language favoring readability (PEP 8) and utilizing 'batteries included' philosophy through its extensive standard library.\n\n Explanation\nPro Python involves understanding the internals: Bytecode, GIL (Global Interpreter Lock), and efficient memory usage via slots or generators.\n\n Advanced Syntax\n[x**2 for x in range(10) if x % 2 == 0]\n\n Example\ndef optimized_sum(n):\n    return n * (n + 1) // 2\n\n Use Case\nBuilding scalable web backends or high-performance data processing pipelines.\n\n Challenge\nWrite a one-liner to generate squares of even numbers from 1 to 20.",
                    "challenge": {
                        "title": "One-Liner Squares",
                        "description": "Use a list comprehension to calculate squares of even numbers from 1 to 20.",
                        "initial_code": "squares = []\nprint(squares)",
                        "solution_code": "squares = [x**2 for x in range(1, 21) if x % 2 == 0]\nprint(squares)",
                        "test_cases": [{"input": "", "expected": "[4, 16, 36, 64, 100, 144, 196, 256, 324, 400]"}]
                    }
                }
            },
            {
                "title": "Variables",
                "beginner": {
                    "content": " BEGINNER LEVEL\n\n Definition\nVariables are like boxes that store data.\n\n Explanation\nYou give a box a name, and put a value inside it. Example: name = 'Renuga'\n\n Syntax\nvariable_name = value\n\n Example\nage = 20\nprint(age)\n\n Use Case\nSaving a user's score in a game.\n\n Knowledge Check\n1. Can a variable name start with a number?\n\n Challenge\nCreate a variable 'city' and store your city name in it.",
                    "challenge": {
                        "title": "City Variable",
                        "description": "Create a variable named 'city' with value 'New York' and print it.",
                        "initial_code": "# Code here",
                        "solution_code": "city = 'New York'\nprint(city)",
                        "test_cases": [{"input": "", "expected": "New York"}]
                    }
                },
                "intermediate": {
                    "content": " INTERMEDIATE LEVEL\n\n Definition\nVariables in Python are references to objects in memory. Python uses dynamic typing.\n\n Explanation\nYou don't need to specify 'int' or 'string'. Names point to objects. x = 5 makes 'x' point to an integer object 5.\n\n Syntax\nname: str = 'John' # Type Hinting\n\n Example\nx, y, z = 1, 2, 3\nprint(x, y, z)\n\n Use Case\nSwapping two variable values without a temporary variable: a, b = b, a\n\n Knowledge Check\n1. What is dynamic typing?\n\n Challenge\nSwap two variables x=10 and y=20 in one line and print them.",
                    "challenge": {
                        "title": "One-Line Swap",
                        "description": "Swap x=10 and y=20 using tuple unpacking. Print x and y.",
                        "initial_code": "x = 10\ny = 20\n# Swap here\nprint(x, y)",
                        "solution_code": "x = 10\ny = 20\nx, y = y, x\nprint(x, y)",
                        "test_cases": [{"input": "", "expected": "20 10"}]
                    }
                },
                "pro": {
                    "content": " PRO LEVEL\n\n Definition\nPython handles variables through namespaces and scopes (Local, Enclosing, Global, Built-in).\n\n Explanation\nPro developers use `__slots__` for memory optimization and understand the difference between mutable and immutable defaults in functions.\n\n Advanced Syntax\ndef func(items=[]): # Dangerous!\n    ...\n\n Example\nimport gc\n# Check reference counts\n\n Use Case\nOptimizing memory in loops or handling deep/shallow copies of complex structures.\n\n Knowledge Check\n1. What is __slots__ used for?\n\n Challenge\nDemonstrate how a global variable can be modified inside a function using the 'global' keyword.",
                    "challenge": {
                        "title": "Global Keyword",
                        "description": "Modify a global variable 'count' inside a function 'increment'.",
                        "initial_code": "count = 0\ndef increment():\n    # Modify count\n    pass\nincrement()\nprint(count)",
                        "solution_code": "count = 0\ndef increment():\n    global count\n    count += 1\nincrement()\nprint(count)",
                        "test_cases": [{"input": "", "expected": "1"}]
                    }
                }
            },
            {
                "title": "Data Types",
                "beginner": {
                    "content": " BEGINNER LEVEL\n\n Definition\nPython has several built-in data types: strings, integers, floats, and booleans.\n\n Explanation\nDifferent types of data need different storage. Text goes in strings, numbers in integers/floats.\n\n Syntax\nname = 'Alice'  # string\nage = 25       # integer\nheight = 5.6   # float\nis_student = True  # boolean\n\n Example\nprint(type(name))  # <class 'str'>\nprint(type(age))   # <class 'int'>\n\n Use Case\nStoring user profile information.\n\n Challenge\nCreate variables for name (string), age (integer), and height (float).",
                    "challenge": {
                        "title": "Data Type Variables",
                        "description": "Create a string variable 'name', integer 'age', and float 'height'. Print all three.",
                        "initial_code": "# Create the variables",
                        "solution_code": "name = 'John'\nage = 30\nheight = 5.9\nprint(name, age, height)",
                        "test_cases": [{"input": "", "expected": "John 30 5.9"}]
                    }
                },
                "intermediate": {
                    "content": " INTERMEDIATE LEVEL\n\n Definition\nPython supports type conversion (casting) between compatible types.\n\n Explanation\nYou can convert strings to numbers, numbers to strings, etc., using built-in functions.\n\n Syntax\nstr(123)    # '123'\nint('456')   # 456\nfloat('3.14') # 3.14\n\n Example\nnum_str = '100'\nnum = int(num_str)\nprint(num * 2)  # 200\n\n Use Case\nProcessing user input which always comes as strings.\n\n Challenge\nConvert string '42' to integer and multiply by 2.",
                    "challenge": {
                        "title": "String to Integer",
                        "description": "Convert the string '42' to an integer and multiply it by 2.",
                        "initial_code": "value = '42'\n# Convert and multiply",
                        "solution_code": "value = '42'\nresult = int(value) * 2\nprint(result)",
                        "test_cases": [{"input": "", "expected": "84"}]
                    }
                },
                "pro": {
                    "content": " PRO LEVEL\n\n Definition\nPython's type system includes type hints for static analysis and optional runtime checking.\n\n Explanation\nType hints improve code readability and enable tools like mypy to catch type errors before runtime.\n\n Advanced Syntax\nfrom typing import List, Dict, Optional\n\ndef process(items: List[int]) -> Dict[str, int]:\n    ...\n\n Example\nfrom typing import Union\nNumber = Union[int, float]\n\ndef add(a: Number, b: Number) -> Number:\n    return a + b\n\n Use Case\nBuilding large-scale applications where type safety is critical.\n\n Challenge\nWrite a function with type hints that takes two integers and returns their sum.",
                    "challenge": {
                        "title": "Type Hints Function",
                        "description": "Write a function add_numbers with type hints that takes two ints and returns an int.",
                        "initial_code": "def add_numbers(a, b):\n    pass\n\nprint(add_numbers(5, 10))",
                        "solution_code": "def add_numbers(a: int, b: int) -> int:\n    return a + b\n\nprint(add_numbers(5, 10))",
                        "test_cases": [{"input": "", "expected": "15"}]
                    }
                }
            },
            {
                "title": "Strings",
                "beginner": {
                    "content": " BEGINNER LEVEL\n\n Definition\nStrings are sequences of characters enclosed in quotes.\n\n Explanation\nYou can use single, double, or triple quotes. Strings are immutable.\n\n Syntax\ngreeting = 'Hello'\nmessage = \"World's\"\n\n Example\nname = 'Python'\nprint(name[0])  # 'P'\nprint(len(name))  # 6\n\n Use Case\nDisplaying text messages to users.\n\n Challenge\nCreate a string with your name and print its first character.",
                    "challenge": {
                        "title": "String First Character",
                        "description": "Create a string with your name and print its first character using indexing.",
                        "initial_code": "name = 'YourName'\n# Print first character",
                        "solution_code": "name = 'Alice'\nprint(name[0])",
                        "test_cases": [{"input": "", "expected": "A"}]
                    }
                },
                "intermediate": {
                    "content": " INTERMEDIATE LEVEL\n\n Definition\nStrings support many methods like upper(), lower(), strip(), split(), and format().\n\n Explanation\nString methods help manipulate and transform text without writing complex logic.\n\n Syntax\ntext.upper()\ntext.lower()\ntext.strip()\ntext.split(',')\n\n Example\nname = '  alice  '\nprint(name.strip().upper())  # 'ALICE'\n\n Use Case\nCleaning and standardizing user input data.\n\n Challenge\nConvert a string to uppercase and remove whitespace.",
                    "challenge": {
                        "title": "String Methods",
                        "description": "Convert '  hello  ' to uppercase and strip whitespace.",
                        "initial_code": "text = '  hello  '\n# Transform and print",
                        "solution_code": "text = '  hello  '\nprint(text.strip().upper())",
                        "test_cases": [{"input": "", "expected": "HELLO"}]
                    }
                },
                "pro": {
                    "content": " PRO LEVEL\n\n Definition\nPython strings are Unicode and support advanced operations like regex, slicing, and f-strings.\n\n Explanation\nUnderstanding string immutability, internment, and efficient concatenation is crucial for performance.\n\n Advanced Syntax\nimport re\npattern = re.compile(r'\\b\\w+\\b')\n\n Example\nname = f'{first} {last}'\n\n Use Case\nText processing, parsing, and complex string manipulations.\n\n Challenge\nUse f-string to format a greeting with a name variable.",
                    "challenge": {
                        "title": "F-String Formatting",
                        "description": "Use an f-string to print 'Hello, John!' where John is a variable.",
                        "initial_code": "name = 'John'\n# Use f-string",
                        "solution_code": "name = 'John'\nprint(f'Hello, {name}!')",
                        "test_cases": [{"input": "", "expected": "Hello, John!"}]
                    }
                }
            }
        ]
    },
    {
        "module_id": 20, # Data Structures
        "topics": [
            {
                "title": "Python Lists",
                "beginner": {
                    "content": " BEGINNER LEVEL\n\n Definition\nA list is a collection of items stored together.\n\n Explanation\nLists use square brackets []. They store multiple values in order.\n\n Syntax\nmy_list = [1, 2, 3]\n\n Example\nfruits = ['apple', 'banana']\nprint(fruits)\n\n Use Case\nShopping lists or playlists.\n\n Knowledge Check\n1. What brackets do lists use?\n\n Challenge\nPrint the first item of list ['a', 'b', 'c']",
                    "challenge": {
                        "title": "First Element",
                        "description": "Print the first element of list L = [10, 20, 30]",
                        "initial_code": "L = [10, 20, 30]\n# Print",
                        "solution_code": "L = [10, 20, 30]\nprint(L[0])",
                        "test_cases": [{"input": "", "expected": "10"}]
                    }
                },
                "intermediate": {
                    "content": " INTERMEDIATE LEVEL\n\n Definition\nLists are mutable, ordered collections that support indexing and slicing.\n\n Explanation\nYou can add with `.append()`, delete with `.remove()`, and slice with `[start:end]`.\n\n Syntax\nL.append(new_item)\n\n Example\nnums = [1, 2, 3, 4, 5]\nprint(nums[1:4]) # [2, 3, 4]\n\n Use Case\nManaging dynamic data like items in a digital inventory.\n\n Knowledge Check\n1. What does .pop() do?\n\n Challenge\nAdd '40' to the list [10, 20, 30] and print the result.",
                    "challenge": {
                        "title": "List Append",
                        "description": "Append 40 to L = [10, 20, 30] and print L.",
                        "initial_code": "L = [10, 20, 30]\n# Append and print",
                        "solution_code": "L = [10, 20, 30]\nL.append(40)\nprint(L)",
                        "test_cases": [{"input": "", "expected": "[10, 20, 30, 40]"}]
                    }
                },
                "pro": {
                    "content": " PRO LEVEL\n\n Definition\nLists are dynamic arrays with amortized O(1) append time and support advanced manipulations like comprehensions and deep copies.\n\n Explanation\nInternally, Python over-allocates memory for lists. Comprehensions are often faster than basic map/filter.\n\n Advanced Syntax\neven_sq = [x*x for x in data if x % 2 == 0]\n\n Example\nmulti_dim = [[1, 2], [3, 4]]\n\n Use Case\nNumerical processing pipelines and matrix manipulation.\n\n Knowledge Check\n1. Time complexity of list append?\n\n Challenge\nFlat a nested list [[1,2], [3,4]] using a nested list comprehension.",
                    "challenge": {
                        "title": "Nested Flattening",
                        "description": "Flatten list L = [[1,2], [3,4]] to [1,2,3,4] using list comprehension.",
                        "initial_code": "L = [[1,2], [3,4]]\n# Flatten\nprint(flat)",
                        "solution_code": "L = [[1,2], [3,4]]\nflat = [item for sublist in L for item in sublist]\nprint(flat)",
                        "test_cases": [{"input": "", "expected": "[1, 2, 3, 4]"}]
                    }
                }
            },
            {
                "title": "Dictionaries",
                "beginner": {
                    "content": " BEGINNER LEVEL\n\n Definition\nDictionaries store key-value pairs, like a real dictionary maps words to definitions.\n\n Explanation\nUse curly braces {}. Keys must be unique, values can be anything.\n\n Syntax\nmy_dict = {'name': 'Alice', 'age': 25}\n\n Example\nperson = {'name': 'Bob', 'city': 'NYC'}\nprint(person['name'])  # 'Bob'\n\n Use Case\nStoring user profiles or configuration settings.\n\n Challenge\nCreate a dictionary with 'name' and 'age' keys, then print the name.",
                    "challenge": {
                        "title": "Dictionary Basics",
                        "description": "Create a dictionary with keys 'name' and 'age', then print the value of 'name'.",
                        "initial_code": "# Create dictionary",
                        "solution_code": "person = {'name': 'Alice', 'age': 30}\nprint(person['name'])",
                        "test_cases": [{"input": "", "expected": "Alice"}]
                    }
                },
                "intermediate": {
                    "content": " INTERMEDIATE LEVEL\n\n Definition\nDictionaries support methods like .get(), .keys(), .values(), and .items().\n\n Explanation\nThese methods help you safely access and iterate over dictionary data.\n\n Syntax\ndict.get('key', default)\ndict.keys()\ndict.values()\n\n Example\nscores = {'math': 90, 'english': 85}\nfor subject, score in scores.items():\n    print(f'{subject}: {score}')\n\n Use Case\nProcessing configuration files or API responses.\n\n Challenge\nUse .get() to safely access a key that might not exist.",
                    "challenge": {
                        "title": "Safe Dictionary Access",
                        "description": "Use .get() to access 'email' from a dict, returning 'Not provided' if missing.",
                        "initial_code": "user = {'name': 'John', 'age': 25}\n# Use .get() for email",
                        "solution_code": "user = {'name': 'John', 'age': 25}\nemail = user.get('email', 'Not provided')\nprint(email)",
                        "test_cases": [{"input": "", "expected": "Not provided"}]
                    }
                },
                "pro": {
                    "content": " PRO LEVEL\n\n Definition\nDictionaries use hash tables for O(1) average lookup time. Python 3.7+ maintains insertion order.\n\n Explanation\nUnderstanding hash collisions and memory overhead helps optimize dictionary usage.\n\n Advanced Syntax\nfrom collections import defaultdict, Counter\n\nfreq = Counter(['a', 'b', 'a', 'c', 'a'])\n\n Example\nfrom collections import OrderedDict\nod = OrderedDict([('a', 1), ('b', 2)])\n\n Use Case\nBuilding high-performance lookup tables and frequency counters.\n\n Challenge\nUse Counter to find the most common element in a list.",
                    "challenge": {
                        "title": "Counter Usage",
                        "description": "Use collections.Counter to find the most frequent item in ['a', 'b', 'a', 'c', 'a', 'b'].",
                        "initial_code": "from collections import Counter\nitems = ['a', 'b', 'a', 'c', 'a', 'b']\n# Find most common",
                        "solution_code": "from collections import Counter\nitems = ['a', 'b', 'a', 'c', 'a', 'b']\nmost_common = Counter(items).most_common(1)[0][0]\nprint(most_common)",
                        "test_cases": [{"input": "", "expected": "a"}]
                    }
                }
            },
            {
                "title": "Tuples",
                "beginner": {
                    "content": " BEGINNER LEVEL\n\n Definition\nTuples are like lists but immutable - they can't be changed after creation.\n\n Explanation\nUse parentheses (). Once created, you can't add, remove, or modify items.\n\n Syntax\nmy_tuple = (1, 2, 3)\n\n Example\ncolors = ('red', 'green', 'blue')\nprint(colors[0])  # 'red'\n\n Use Case\nStoring constant data like coordinates or configuration.\n\n Challenge\nCreate a tuple with 3 numbers and print the second element.",
                    "challenge": {
                        "title": "Tuple Access",
                        "description": "Create a tuple (10, 20, 30) and print the second element.",
                        "initial_code": "# Create tuple",
                        "solution_code": "nums = (10, 20, 30)\nprint(nums[1])",
                        "test_cases": [{"input": "", "expected": "20"}]
                    }
                },
                "intermediate": {
                    "content": " INTERMEDIATE LEVEL\n\n Definition\nTuples support unpacking and are often used for returning multiple values from functions.\n\n Explanation\nTuple unpacking lets you assign multiple variables at once.\n\n Syntax\na, b, c = my_tuple\n\n Example\nx, y = (10, 20)\nprint(x, y)  # 10 20\n\n Use Case\nReturning multiple values from functions or swapping variables.\n\n Challenge\nUse tuple unpacking to assign values to x, y, z from (1, 2, 3).",
                    "challenge": {
                        "title": "Tuple Unpacking",
                        "description": "Unpack (1, 2, 3) into variables x, y, z and print them.",
                        "initial_code": "data = (1, 2, 3)\n# Unpack",
                        "solution_code": "data = (1, 2, 3)\nx, y, z = data\nprint(x, y, z)",
                        "test_cases": [{"input": "", "expected": "1 2 3"}]
                    }
                },
                "pro": {
                    "content": " PRO LEVEL\n\n Definition\nTuples are more memory-efficient than lists and can be used as dictionary keys.\n\n Explanation\nBecause tuples are immutable and hashable, they can serve as dictionary keys unlike lists.\n\n Advanced Syntax\nlocations = {(40.7, -74.0): 'NYC'}\n\n Example\npoint = (3, 4)\nmagnitude = (point[0]**2 + point[1]**2)**0.5\n\n Use Case\nCoordinate systems, database keys, and immutable data structures.\n\n Challenge\nUse a tuple as a dictionary key to store a value.",
                    "challenge": {
                        "title": "Tuple Dictionary Key",
                        "description": "Create a dict with tuple (1, 2) as key and 'value' as value, then access it.",
                        "initial_code": "# Create dict with tuple key",
                        "solution_code": "my_dict = {(1, 2): 'value'}\nprint(my_dict[(1, 2)])",
                        "test_cases": [{"input": "", "expected": "value"}]
                    }
                }
            },
            {
                "title": "Sets",
                "beginner": {
                    "content": " BEGINNER LEVEL\n\n Definition\nSets are unordered collections of unique elements.\n\n Explanation\nUse curly braces {}. Duplicates are automatically removed.\n\n Syntax\nmy_set = {1, 2, 3}\n\n Example\nnumbers = {1, 2, 2, 3}\nprint(numbers)  # {1, 2, 3}\n\n Use Case\nRemoving duplicates from lists or checking membership.\n\n Challenge\nCreate a set from [1, 2, 2, 3] and print it.",
                    "challenge": {
                        "title": "Set Creation",
                        "description": "Create a set from list [1, 2, 2, 3, 3] and print it.",
                        "initial_code": "nums = [1, 2, 2, 3, 3]\n# Create set",
                        "solution_code": "nums = [1, 2, 2, 3, 3]\nunique = set(nums)\nprint(unique)",
                        "test_cases": [{"input": "", "expected": "{1, 2, 3}"}]
                    }
                },
                "intermediate": {
                    "content": " INTERMEDIATE LEVEL\n\n Definition\nSets support mathematical operations like union, intersection, and difference.\n\n Explanation\nThese operations help find common or unique elements between sets.\n\n Syntax\nset1.union(set2)\nset1.intersection(set2)\nset1.difference(set2)\n\n Example\na = {1, 2, 3}\nb = {3, 4, 5}\nprint(a.intersection(b))  # {3}\n\n Use Case\nFinding common items between lists or filtering duplicates.\n\n Challenge\nFind the intersection of {1, 2, 3} and {2, 3, 4}.",
                    "challenge": {
                        "title": "Set Intersection",
                        "description": "Find common elements between {1, 2, 3} and {2, 3, 4}.",
                        "initial_code": "a = {1, 2, 3}\nb = {2, 3, 4}\n# Find intersection",
                        "solution_code": "a = {1, 2, 3}\nb = {2, 3, 4}\nprint(a.intersection(b))",
                        "test_cases": [{"input": "", "expected": "{2, 3}"}]
                    }
                },
                "pro": {
                    "content": " PRO LEVEL\n\n Definition\nSets use hash tables for O(1) average lookup time, making them ideal for membership testing.\n\n Explanation\nSet operations are highly optimized for performance-critical code.\n\n Advanced Syntax\nfrom functools import reduce\n\n Example\nlarge_set = set(range(1000000))\nprint(500000 in large_set)  # O(1) lookup\n\n Use Case\nFast membership testing, deduplication, and set-based algorithms.\n\n Challenge\nCheck if 5 is in a set of numbers 1-10 using membership testing.",
                    "challenge": {
                        "title": "Set Membership",
                        "description": "Create a set {1, 2, 3, 4, 5} and check if 3 is in it.",
                        "initial_code": "nums = {1, 2, 3, 4, 5}\n# Check membership",
                        "solution_code": "nums = {1, 2, 3, 4, 5}\nprint(3 in nums)",
                        "test_cases": [{"input": "", "expected": "True"}]
                    }
                }
            }
        ]
    },
    {
        "module_id": 21, # Control Flow
        "topics": [
            {
                "title": "If-Else Statements",
                "beginner": {
                    "content": " BEGINNER LEVEL\n\n Definition\nIf-else statements let your code make decisions based on conditions.\n\n Explanation\nThink of it as a fork in the road - you go one way if a condition is true, another if false.\n\n Syntax\nif condition:\n    do_this()\nelse:\n    do_that()\n\n Example\nage = 18\nif age >= 18:\n    print('You can vote')\nelse:\n    print('Too young to vote')\n\n Use Case\nValidating user input or checking permissions.\n\n Challenge\nWrite an if-else to check if a number is positive or negative.",
                    "challenge": {
                        "title": "Positive or Negative",
                        "description": "Check if number = -5 is positive or negative and print the result.",
                        "initial_code": "number = -5\n# Check and print",
                        "solution_code": "number = -5\nif number >= 0:\n    print('Positive')\nelse:\n    print('Negative')",
                        "test_cases": [{"input": "", "expected": "Negative"}]
                    }
                },
                "intermediate": {
                    "content": " INTERMEDIATE LEVEL\n\n Definition\nYou can chain multiple conditions with elif for complex decision trees.\n\n Explanation\nElif allows you to check multiple conditions in sequence without nesting.\n\n Syntax\nif condition1:\n    ...\nelif condition2:\n    ...\nelse:\n    ...\n\n Example\nscore = 85\nif score >= 90:\n    grade = 'A'\nelif score >= 80:\n    grade = 'B'\nelse:\n    grade = 'C'\n\n Use Case\nGrading systems or tiered pricing.\n\n Challenge\nUse elif to grade a score of 75 as A, B, or C.",
                    "challenge": {
                        "title": "Grading with Elif",
                        "description": "Grade score 75: A for >=90, B for >=80, C otherwise.",
                        "initial_code": "score = 75\n# Grade the score",
                        "solution_code": "score = 75\nif score >= 90:\n    print('A')\nelif score >= 80:\n    print('B')\nelse:\n    print('C')",
                        "test_cases": [{"input": "", "expected": "C"}]
                    }
                },
                "pro": {
                    "content": " PRO LEVEL\n\n Definition\nPython supports ternary expressions for concise conditional assignments.\n\n Explanation\nTernary operators are one-line if-else expressions, useful for simple conditions.\n\n Advanced Syntax\nvalue = true_value if condition else false_value\n\n Example\nstatus = 'active' if user.is_logged_in else 'inactive'\n\n Use Case\nSetting default values or conditional assignments in list comprehensions.\n\n Challenge\nUse ternary operator to assign 'adult' or 'child' based on age.",
                    "challenge": {
                        "title": "Ternary Operator",
                        "description": "Use ternary operator to set status = 'adult' if age >= 18 else 'child'.",
                        "initial_code": "age = 20\n# Use ternary operator",
                        "solution_code": "age = 20\nstatus = 'adult' if age >= 18 else 'child'\nprint(status)",
                        "test_cases": [{"input": "", "expected": "adult"}]
                    }
                }
            },
            {
                "title": "Loops",
                "beginner": {
                    "content": " BEGINNER LEVEL\n\n Definition\nLoops let you repeat code multiple times without writing it repeatedly.\n\n Explanation\nFor loops iterate over sequences, while loops repeat while a condition is true.\n\n Syntax\nfor item in list:\n    do_something()\n\nwhile condition:\n    do_something()\n\n Example\nfor i in range(5):\n    print(i)  # 0, 1, 2, 3, 4\n\n Use Case\nProcessing lists of items or repeating tasks.\n\n Challenge\nPrint numbers 1 to 5 using a for loop.",
                    "challenge": {
                        "title": "For Loop Basics",
                        "description": "Use a for loop to print numbers 1 through 5.",
                        "initial_code": "# Write for loop",
                        "solution_code": "for i in range(1, 6):\n    print(i)",
                        "test_cases": [{"input": "", "expected": "1\n2\n3\n4\n5"}]
                    }
                },
                "intermediate": {
                    "content": " INTERMEDIATE LEVEL\n\n Definition\nLoops support break, continue, and else clauses for advanced control flow.\n\n Explanation\nBreak exits the loop, continue skips to next iteration, else runs if loop completes normally.\n\n Syntax\nfor item in items:\n    if condition:\n        break\n    if other_condition:\n        continue\nelse:\n    # Runs if no break\n\n Example\nfor i in range(10):\n    if i == 5:\n        break\n    print(i)  # 0, 1, 2, 3, 4\n\n Use Case\nSearching for items or handling early exit conditions.\n\n Challenge\nUse break to exit a loop when you find the number 3.",
                    "challenge": {
                        "title": "Loop Break",
                        "description": "Loop through 1-10 and break when you find 3.",
                        "initial_code": "for i in range(1, 11):\n    # Add break condition",
                        "solution_code": "for i in range(1, 11):\n    if i == 3:\n        break\n    print(i)",
                        "test_cases": [{"input": "", "expected": "1\n2"}]
                    }
                },
                "pro": {
                    "content": " PRO LEVEL\n\n Definition\nPython supports list comprehensions, generator expressions, and functional programming patterns.\n\n Explanation\nThese constructs provide concise, efficient ways to process data without explicit loops.\n\n Advanced Syntax\nresult = [process(x) for x in items if condition]\nresult = (process(x) for x in items)  # Generator\n\n Example\nsquares = [x**2 for x in range(10)]\n\n Use Case\nData processing pipelines and functional programming.\n\n Challenge\nUse list comprehension to create a list of squares from 1-5.",
                    "challenge": {
                        "title": "List Comprehension",
                        "description": "Create a list of squares from 1 to 5 using list comprehension.",
                        "initial_code": "# Use list comprehension",
                        "solution_code": "squares = [x**2 for x in range(1, 6)]\nprint(squares)",
                        "test_cases": [{"input": "", "expected": "[1, 4, 9, 16, 25]"}]
                    }
                }
            },
            {
                "title": "Functions",
                "beginner": {
                    "content": " BEGINNER LEVEL\n\n Definition\nFunctions are reusable blocks of code that perform specific tasks.\n\n Explanation\nThink of functions as recipes - you write them once and use them many times.\n\n Syntax\ndef function_name():\n    # code here\n    return result\n\n Example\ndef greet():\n    return 'Hello!'\n\nprint(greet())  # Hello!\n\n Use Case\nOrganizing code and avoiding repetition.\n\n Challenge\nWrite a function that returns 'Hello World'.",
                    "challenge": {
                        "title": "Simple Function",
                        "description": "Create a function hello() that returns 'Hello World'.",
                        "initial_code": "def hello():\n    pass\n\nprint(hello())",
                        "solution_code": "def hello():\n    return 'Hello World'\n\nprint(hello())",
                        "test_cases": [{"input": "", "expected": "Hello World"}]
                    }
                },
                "intermediate": {
                    "content": " INTERMEDIATE LEVEL\n\n Definition\nFunctions can accept parameters and return values.\n\n Explanation\nParameters make functions flexible by allowing different inputs.\n\n Syntax\ndef function_name(param1, param2):\n    return param1 + param2\n\n Example\ndef add(a, b):\n    return a + b\n\nprint(add(5, 3))  # 8\n\n Use Case\nCreating reusable, flexible code blocks.\n\n Challenge\nWrite a function that takes two numbers and returns their sum.",
                    "challenge": {
                        "title": "Function Parameters",
                        "description": "Write a function add(a, b) that returns a + b.",
                        "initial_code": "def add(a, b):\n    pass\n\nprint(add(5, 10))",
                        "solution_code": "def add(a, b):\n    return a + b\n\nprint(add(5, 10))",
                        "test_cases": [{"input": "", "expected": "15"}]
                    }
                },
                "pro": {
                    "content": " PRO LEVEL\n\n Definition\nPython supports default arguments, keyword arguments, *args, **kwargs, and lambda functions.\n\n Explanation\nThese advanced features enable flexible function design and functional programming patterns.\n\n Advanced Syntax\ndef func(a, b=10, *args, **kwargs):\n    ...\n\nlambda x: x * 2\n\n Example\ndef process(*args, **kwargs):\n    print(args, kwargs)\n\n Use Case\nBuilding flexible APIs and higher-order functions.\n\n Challenge\nWrite a function with *args that sums all arguments.",
                    "challenge": {
                        "title": "Variable Arguments",
                        "description": "Write a function sum_all(*args) that returns the sum of all arguments.",
                        "initial_code": "def sum_all(*args):\n    pass\n\nprint(sum_all(1, 2, 3, 4))",
                        "solution_code": "def sum_all(*args):\n    return sum(args)\n\nprint(sum_all(1, 2, 3, 4))",
                        "test_cases": [{"input": "", "expected": "10"}]
                    }
                }
            }
        ]
    },
    {
        "module_id": 22, # Object-Oriented Programming
        "topics": [
            {
                "title": "Classes and Objects",
                "beginner": {
                    "content": " BEGINNER LEVEL\n\n Definition\nClasses are blueprints for creating objects with properties and behaviors.\n\n Explanation\nThink of a class as a cookie cutter and objects as the cookies made from it.\n\n Syntax\nclass MyClass:\n    def __init__(self):\n        self.property = value\n\n Example\nclass Dog:\n    def __init__(self, name):\n        self.name = name\n\nmy_dog = Dog('Buddy')\n\n Use Case\nModeling real-world entities in code.\n\n Challenge\nCreate a simple Person class with a name attribute.",
                    "challenge": {
                        "title": "Simple Class",
                        "description": "Create a Person class with __init__ that sets self.name.",
                        "initial_code": "class Person:\n    def __init__(self, name):\n        pass\n\np = Person('Alice')\nprint(p.name)",
                        "solution_code": "class Person:\n    def __init__(self, name):\n        self.name = name\n\np = Person('Alice')\nprint(p.name)",
                        "test_cases": [{"input": "", "expected": "Alice"}]
                    }
                },
                "intermediate": {
                    "content": " INTERMEDIATE LEVEL\n\n Definition\nClasses can have methods (functions inside classes) and class attributes.\n\n Explanation\nMethods define behaviors, class attributes are shared across all instances.\n\n Syntax\nclass MyClass:\n    class_attr = 'shared'\n    \n    def method(self):\n        return self.instance_attr\n\n Example\nclass Car:\n    wheels = 4\n    \n    def __init__(self, color):\n        self.color = color\n\n Use Case\nOrganizing related data and behavior together.\n\n Challenge\nAdd a method greet() to Person that returns a greeting.",
                    "challenge": {
                        "title": "Class Method",
                        "description": "Add a method greet() to Person that returns 'Hello, I am {name}'.",
                        "initial_code": "class Person:\n    def __init__(self, name):\n        self.name = name\n    \n    # Add greet method\n\np = Person('Bob')\nprint(p.greet())",
                        "solution_code": "class Person:\n    def __init__(self, name):\n        self.name = name\n    \n    def greet(self):\n        return f'Hello, I am {self.name}'\n\np = Person('Bob')\nprint(p.greet())",
                        "test_cases": [{"input": "", "expected": "Hello, I am Bob"}]
                    }
                },
                "pro": {
                    "content": " PRO LEVEL\n\n Definition\nPython supports inheritance, polymorphism, encapsulation, and special methods (__dunder__ methods).\n\n Explanation\nThese OOP principles enable code reuse, abstraction, and operator overloading.\n\n Advanced Syntax\nclass Child(Parent):\n    def __init__(self):\n        super().__init__()\n    \n    def __str__(self):\n        return self.name\n\n Example\nclass Animal:\n    def speak(self):\n        pass\n\nclass Dog(Animal):\n    def speak(self):\n        return 'Woof!'\n\n Use Case\nBuilding complex systems with hierarchical relationships.\n\n Challenge\nCreate a Child class that inherits from Parent and calls super().__init__().",
                    "challenge": {
                        "title": "Inheritance",
                        "description": "Create Child class inheriting from Parent with super().__init__ call.",
                        "initial_code": "class Parent:\n    def __init__(self, name):\n        self.name = name\n\nclass Child(Parent):\n    def __init__(self, name, age):\n        # Call super and add age\n        pass\n\nc = Child('Tom', 10)\nprint(c.name, c.age)",
                        "solution_code": "class Parent:\n    def __init__(self, name):\n        self.name = name\n\nclass Child(Parent):\n    def __init__(self, name, age):\n        super().__init__(name)\n        self.age = age\n\nc = Child('Tom', 10)\nprint(c.name, c.age)",
                        "test_cases": [{"input": "", "expected": "Tom 10"}]
                    }
                }
            }
        ]
    }
]
