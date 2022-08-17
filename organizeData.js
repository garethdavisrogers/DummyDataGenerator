const Fs = require('fs');
const {Client} = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const dbConnect = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

Client.connect();

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
let socialSecurityNumbers = [];
let phoneNumbers = [];
let addresses = [];
let zips = [];

function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
};

function generateBirthdate(){
    let year = ((~~(Math.random() * (2004-1920 + 1))) + 1920).toString();
    let month = ((~~(Math.random() * (12 - 1))) + 1).toString();
    let day = ((~~(Math.random() * (28 - 1))) + 1).toString();
    return `${year}-${month}-${day}`;
};

function generateNumber(n, formatType = 'ssn'){
    let part1 = (~~(Math.random()*(999-100+1)+100)).toString();
    let part2 = (~~(Math.random()*(999-100+1)+100)).toString();
    let part3 = (~~(Math.random()*(9999-1000+1)+1000)).toString();
    if(formatType == 'phone'){
        return `(${part1})${part2}-${part3}`;
    } else {
        const rawSSN = `${part1}-${part2}-${part3}`;
        async function hashSSN(ssn){
            const salt = await bcrypt.genSalt(10);
            const hashedSSN = await bcrypt.hash(ssn, salt);
            return hashedSSN;
        }
        return hashSSN(rawSSN);
    }
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

function generateVoter(n){
    if(n > 99999){
        return 'Number is too large';
    }
    while(n > 0){
        const lastNamesLength = lastNames.length - 1;
    const firstNamesLength = firstNames.length - 1;
    const randLastNameInt = ~~(Math.random() * lastNamesLength);
    const randfirstNameInt = ~~(Math.random() * firstNamesLength);
    const lastName = lastNames[randLastNameInt];
    const firstName = firstNames[randFirstNameInt];
    const socialSecurityNumber = generateNumber('ssn');
    const phoneNumber = generateNumber();
    const birthDate = generateBirthdate();
    const homeAddress = generateAddress();
    const zipCode = generateZip();
    const sql = `INSERT INTO _voters (LastName, FirstName, SocialSecurityNumberHash
    , HomeAddress, HomeZip, HomeStateID, PhoneNumber, BirthDate) VALUES 
    (${lastName}, ${firstName}, ${socialSecurityNumber}
    , ${homeAddress}, ${zipCode}, 34, ${phoneNumber}, ${birthDate})`;

    dbConnect.query(sql, (err, res)=>{
        if(err){
            console.log(err);
        } else {
            console.log(res);
        }
    });
    n--;
    }
}