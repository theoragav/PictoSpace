# PictoSpace: Photo Gallery

## Project Description

PictoSpace is a dynamic web gallery platform where users can upload, share, and comment on images within personal galleries. Drawing inspiration from popular social platforms like Instagram and Google Photos, this project focuses on enabling secure user authentication, authorization, and gallery management. With a user-friendly interface and a robust backend, PictoSpace allows individuals to create their own galleries, interact with others’ content, and manage their own media.

![1](https://github.com/user-attachments/assets/d6047e3f-b5ff-4249-8eed-d3b828c19efb)
![3](https://github.com/user-attachments/assets/cdbc4a0a-538f-4729-83bc-c284d0b6a4a6)
![2](https://github.com/user-attachments/assets/180ace81-e989-4388-9b56-148d9962b764)
![4](https://github.com/user-attachments/assets/5bfd0f05-8411-45f7-89a1-a7cd065f6782)
![4 5](https://github.com/user-attachments/assets/06ab9d7a-23fb-47fc-aa38-dcce02e2a998)
![5](https://github.com/user-attachments/assets/78254527-a020-4931-bb9f-881c22f680ad)
![6](https://github.com/user-attachments/assets/4ce7ed26-1bf3-43a4-92bb-d6e35b85cd08)
![7](https://github.com/user-attachments/assets/dace938a-2446-4a46-87ce-9ea51ddafe3d)


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
