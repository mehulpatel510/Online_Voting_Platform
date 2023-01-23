# Online Voting System

### Introduction
> This a web application *Online Voting System* created with NodeJS framework.
> In this application, Two different user's role play a key role. One is admin for managing a election like create election, add questions related to election objective and add voter from whom they expect the opinion. Second user is vote, who will cast the vote for related election and also check the result.

![Workflow Diagram for Online Voting System](/public/ScreenShorts/Workflow%20Diagram-3.png)
 
## Demonstration
For testing purpose use following credential.

**Site URL:** https://mehul-ovs.onrender.com 

**For Admin:**
* Existing Users:
    - Username - admin@gmail.com  (In place of Voter ID)
    - Password - admin

* For new registration of admin
    >Note: use 'admin' keyword in your username/email id like admin123@gmail.com


**For voter:**
* Existing user:
    - VoterId: ABCD1
    - password: ABCD1

## Hierarchy of web pages
+ index (Default Page)
    + Sign Up
    + Login (**As admin**)
        + Elections
            + New Election
            + Election Page (For selected Election)
                + Manage Questions
                    + View Questions
                    + New Question
                    + Edit Question
                    + Delete Question
                    + View Options (For selected question)
                    + Add Option
                    + Edit Option
                    + Delete Option
                + Manage Voter
                    + View Voters
                        + Add Voter
                        + Edit Voter Password
                        + Delete Voter
                + Preview Ballot Paper
                + Launch Election/End Election
                + Preview Result
    + Login (**As Voter**)
        + Cast a vote for selected election
        + preview (result)

## Videos:
+ https://www.loom.com/share/11844e33b42f43beb60d689ef1ee4d02
+ https://www.loom.com/share/76b7708e7fea4a0ea407dcad207864ec

## Screen Shorts:
![Login Page](/public/ScreenShorts/Login.PNG)
![List of Elections](/public/ScreenShorts/List_of_Elections.PNG)
![Manage Election](/public/ScreenShorts/Manage_Election.PNG)
![Manage Question](/public/ScreenShorts/Manage_Question.PNG)
![Manage Options](/public/ScreenShorts/Manage_Options.PNG)
![Manahe Voters](/public/ScreenShorts/Manage_Voters.PNG)
![Preview Ballot Paper](/public/ScreenShorts/Preview_Ballot_Paper.PNG)
![Lanched Election](/public/ScreenShorts/Lanched_Election.PNG)
![Voting Page for public](/public/ScreenShorts/Voting_Page_for_Public.PNG)
![Cast a Vote By Voter](/public/ScreenShorts/Cast_a_Vote_by_Voter.PNG)
![Preview Result](/public/ScreenShorts/Preview_Result.PNG)





    
