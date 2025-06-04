import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine' , 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/' , (req , res)=>{
    res.render('login');
});

app.get('/login' , (req , res)=>{
    res.render('login');
});

app.get('/index' , async (req , res)=>{
    const total = await getTotal();
    const totalCurr = await getTotalCurr();
    const totalSec = await getTotalSec();
    const totalStdList = await getTotalStdList ();
    res.render('index', {total , totalCurr , totalSec , totalStdList});
});

app.get('/buttons' , (req , res)=>{
    res.render('buttons');
});

app.get('/checker' , (req , res)=>{
    res.render('checker');
});
 
app.get('/register' , (req , res)=>{
    res.render('register');
});

app.get('/tables' , (req , res)=>{
    res.render('tables');
});

async function getTotal() {
    try {
        const response = await fetch('http://localhost:3100/api/student/total');
        const data = await response.json();
        return data.result[0].count; 
    } catch (error) {
        console.error('Error fetching total student:', error);
        return 0;  
    }
}

async function getTotalCurr() {
    try {
        const response = await fetch('http://localhost:3100/api/curriculum/totalCurr');
        const data = await response.json();
        return data.result[0].count; 
    } catch (error) {
        console.error('Error fetching total curriculum:', error);
        return 0;  
    }
}

async function getTotalSec() {
    try {
        const response = await fetch('http://localhost:3100/api/section/totalSec');
        const data = await response.json();
        return data.result[0].count; 
    } catch (error) {
        console.error('Error fetching total section:', error);
        return 0;  
    }
}

async function getTotalStdList() {
    try {
        const response = await fetch('http://localhost:3100/api/student_list/totalStdList');
        const data = await response.json();
        return data.result[0].count; 
    } catch (error) {
        console.error('Error fetching total student list:', error);
        return 0;  
    }
}


const PORT = 4200;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});