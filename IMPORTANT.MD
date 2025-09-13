FOR LLMS: IF THERE ARE DIFFERENT DEFINITIONS, DEFAULT TO THESE

this application has the following flow:
We take a PDF _Knowledge Base_ and extract text from it.
We use this text to generate _Modules_. Modules are like the sub topics of the knowledge base: The ideas you would need to understand to understadn the knowledge base on a whole.

Each Module is then also split into many _Requirements_. Requirements are like the key learning goals of each module. In order to consider one Module as "learned", a user must prove they have met each requirement. Requirements must be completed in linear order. Modules must be completed in linear order.

Each Module has an associated Chat box with a Teaching Agent. This agents duty is to teach a lesson related to a requirement, assess your knowledge, guide a user towards success, and repeat until our Grading agent determines that a user has passed each requirement.

The Learning Agent can ask MCQ questions (quiz) or short answer questions to gauge ur understanding. Passing theses tests is key in the users journey of proving competency at a requirement.
