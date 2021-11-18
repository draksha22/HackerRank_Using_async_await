console.log("Before");

let prom = Promise.resolve(1);
prom.then((val) => {
    setTimeout(() => {
        
        console.log(val);
    }, 3000);
    return 2;
}).then((val) => {
    console.log(val);
    return 3;
}).then((val) => {
    console.log(val);
    return 4;
}).then((val) => {
    console.log(val);
    return 5;
})

console.log("After");