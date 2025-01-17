# PictoSpace: Photo Gallery

## Project Description

PictoSpace is a dynamic web gallery platform where users can upload, share, and comment on images within personal galleries. Drawing inspiration from popular social platforms like Instagram and Google Photos, this project focuses on enabling secure user authentication, authorization, and gallery management. With a user-friendly interface and a robust backend, PictoSpace allows individuals to create their own galleries, interact with others’ content, and manage their own media.

## Features

- **User Authentication & Authorization**: 
  - Users are authenticated using session-based local authentication.
  - Access to the platform is governed by an authorization policy.
  
- **Authorization Policy**:
  - **Unauthenticated Users**: Cannot read any pictures or comments.
  - **Authenticated Users**: 
    - Can browse any gallery.
    - Can sign out of the application.
    - Can post comments on any picture in any gallery.
    - Can delete their own comments (but not others' comments).
  - **Gallery Owners**: 
    - Can upload and delete pictures to their own galleries only.
    - Can delete any comment on any picture within their own gallery.
  
- **Multiple Galleries**: Each user has their own gallery, allowing them to upload and manage their own media.
  
- **Commenting System**: Users can post comments on any picture, delete their own comments, and gallery owners can delete any comment within their own gallery.
  
- **RESTful API**: A structured API for managing galleries, images, and comments, with strict access control and user permissions ensuring proper authorization for different user types.

- **Frontend Interface**: Built with HTML, CSS, and JavaScript, the frontend allows users to interact with galleries, upload images, and post comments.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: NeDB (embedded NoSQL database)
- **Frontend**: HTML, CSS, JavaScript
- **Testing**: Unit testing using Mocha/Chai or a similar framework
  

## Installation

To get started with PictoSpace, follow the steps below:

### 1. Install dependencies

```bash
npm install
```


### 2. Running the Application

```bash
npm run prod
```

### 3. Running Unit Tests

```bash
npm run test
```