# ExpLore

ExpLore is an interactive web app that helps users discover hidden gems and popular spots in any city they’re curious about. Built with Django, Mapbox GL JS, and the Yelp Fusion API, the app maps out location-based recommendations from Yelp alongside user-submitted suggestions.

## Technologies

- `Django`
- `Mapbox GL JS`
- `Yelp Fusion API`
- `PostGreSQL`
- `HTML`
- `CSS`
- `JavaScript`

## Features

Backend | Frontend
--------|-------- 
Communicates with the Yelp Fusion API to fetch location-based data | Integrates with Mapbox GL JS to render an interactive map interface
Formats and stores data in a PostgreSQL database for efficient management and scalability | Sends requests to backend API endpoints to retrieve and display organized data
Handles user authentication using Django’s built-in authentication system | Implements custom UI buttons to filter map markers by category
Processes user-submitted forms to enable dynamic growth of the dataset | Displays a list of user-saved locations and marked experiences
 
## The Process

The idea for ExpLore began as a casual conversation among friends about how scattered and inconsistent travel recommendations can be online. To address this, I set out to build a centralized platform where users could explore cities from the comfort of their own homes. The project started with designing an interactive map using Mapbox, which displays location data retrieved from Yelp Fusion and processed through the backend.

As development progressed, I added key features to make the app more usable and secure, such as user authentication, a request page for local recommendations, and filters to help users discover points of interest more easily. While the app is still in its early stages, I built it as a learning project to strengthen my software development skills and lay the foundation for future improvements.

Most recently, I deployed ExpLore using Vercel, which required converting the database to be compatible with Supabase’s hosted PostgreSQL. This allowed me to make the app accessible online for live demos and testing. This project continues to grow as I apply new lessons and refine the overall user experience.

## Goals and Future Direction

While the backend currently provides a foundational structure, I plan to revisit and expand this project in the future. My long-term goal is to evolve ExpLore into a lightweight social platform where users can explore destinations, discover hidden gems, and share personal insights about cities they love. I envision a community-driven experience where trust and engagement grow organically as users interact, contribute recommendations, and build connections through the platform.

## Preview

https://github.com/user-attachments/assets/f00ab7f4-9f40-436c-9fd4-0e3f9f300228

## Demo 

You can register an account or try out the features with the sample account on the login page at:
https://explore-omega-six.vercel.app/
