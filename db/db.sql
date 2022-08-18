CREATE TABLE IF NOT EXISTS _voters(
    ID SERIAL NOT NULL PRIMARY KEY,
    LastName VARCHAR(30) NOT NULL,
    FirstName VARCHAR(30) NOT NULL,
    SocialSecurityNumberHash VARCHAR(200) NOT NULL,
    HomeAddress VARCHAR(60) NOT NULL,
    HomeZip VARCHAR(5) NOT NULL,
    HomeStateID INT NOT NULL,
    PhoneNumber VARCHAR(20),
    BirthDate DATE NOT NULL
);