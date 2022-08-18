const Fs = require('fs');
const {Client} = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const dbConnect = new Client({
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

dbConnect.connect((err)=>{
    if(err){
        throw err;
    } else {
        console.log('connected');
    }
});

let lastNamesFile = Fs.readFileSync('datasamples/lastNames.txt').toString();
let boyFirstNamesFile = Fs.readFileSync('datasamples/firstNamesBoy.txt').toString();
let girlFirstNamesFile = Fs.readFileSync('datasamples/firstNamesGirl.txt').toString();
const lastNames = shuffleArray(lastNamesFile.split('\n'));
boyFirstNames = boyFirstNamesFile.split('\n');
girlFirstNames = girlFirstNamesFile.split('\n');
const firstNames = shuffleArray(boyFirstNames.concat(girlFirstNames));
let streetNames = Fs.readFileSync('datasamples/streetNames.txt').toString();
let zipCodes = Fs.readFileSync('datasamples/northDakotaZips.txt').toString();
streetNames = streetNames.split('\n');
zipCodes = zipCodes.split('\n');

function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
};

function generateBirthdate(){
    let year = ((~~(Math.random() * (2004-1920 + 1))) + 1920).toString();
    let month = ((~~(Math.random() * (12 - 1))) + 1).toString();
    let day = ((~~(Math.random() * (28 - 1))) + 1).toString();
    return `${year}-${month}-${day}`;
};

function generatePhoneNumber(){
    let part1 = (~~(Math.random()*(999-100+1)+100)).toString();
    let part2 = (~~(Math.random()*(999-100+1)+100)).toString();
    let part3 = (~~(Math.random()*(9999-1000+1)+1000)).toString();
    return `(${part1})${part2}-${part3}`;
}

async function generateSSNNumber(){
    let part1 = (~~(Math.random()*(999-100+1)+100)).toString();
    let part2 = (~~(Math.random()*(999-100+1)+100)).toString();
    let part3 = (~~(Math.random()*(9999-1000+1)+1000)).toString();   
    const rawSSN = `${part1}-${part2}-${part3}`;
    const salt = await bcrypt.genSalt(10)
    const hashedSSN = await bcrypt.hash(rawSSN, salt);
    return hashedSSN;
}

function generateAddress(streets){
    const streetsLength = streets.length - 1;
    let houseNumber = ~~(Math.random() * 99999) + 1;
    let randomStreetInd = ~~(Math.random() * streetsLength) + 1;
    let streetName = streets[randomStreetInd];
    return houseNumber.toString() + ' ' + streetName;
}

function generateNDZip(z){
    const zipLength = z.length - 1;
    let randomZipInd = ~~(Math.random() * zipLength) + 1;
    let tempZip = z[randomZipInd];
    return tempZip;
}

async function generateVoter(n){
    if(n > 99999){
        return 'Number is too large';
    }
    while(n > 0){
        const lastNamesLength = lastNames.length - 1;
        const firstNamesLength = firstNames.length - 1;
        const randLastNameInt = ~~(Math.random() * lastNamesLength);
        const randFirstNameInt = ~~(Math.random() * firstNamesLength);
        const lastName = lastNames[randLastNameInt];
        const firstName = firstNames[randFirstNameInt];
        const socialSecurityNumber = await generateSSNNumber();
        const phoneNumber = generatePhoneNumber();
        const birthDate = generateBirthdate();
        const homeAddress = generateAddress(streetNames);
        const zipCode = generateNDZip(zipCodes);
        let sql = `INSERT INTO _voters(LastName, FirstName, SocialSecurityNumberHash,HomeAddress, HomeZip, HomeStateID, PhoneNumber, BirthDate) 
        VALUES (${lastName}, ${firstName}, ${socialSecurityNumber},${homeAddress}, ${zipCode}, 34, ${phoneNumber}, ${birthDate})
        RETURNING *`;
        sql = sql.replace(/\r?\n|\r/g, " ");

        dbConnect.query(sql, (err, res)=>{
            if(err){
                console.log(err);
                return;
            } else {
                console.log(res);
            }
        });
        n--;
    }
}

generateVoter(10);