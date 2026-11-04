const earningsElement = document.getElementById('totalEarnings');
const tokensElement = document.getElementById('tokensUsed');
/*
onGetEarnings(earningsElement);
onGetTokens(tokensElement);
*/
async function onGetEarnings(element) {
    // Here we register what the total earnings is using an API call to the database 
    element.textContent = 'Fetching earnings...';
    const response = await fetch('/api/earnings/total/');
    if (response.ok){ // If HTTP 2xx! (Most likely 200)
        const earnings = response.json;
        setVisualElementValue("ern", earnings, element)
    } else { // Uh oh-
        element.textContent = 'Failed to load earnings. Please try again later'
    }
};

async function onGetTokens(element) {
    // Here we register what the total token usage is using an API call to the database 
    element.textContent = 'Loading: tokens...';
    const response = await fetch('/api/tokens/used/');
    if (response.ok){ // Same call as earlier just a different API entrypoint
        const tokens = response.json;
        setVisualElementValue("tkn", tokens, element)
    } else { // Not OK :(
        element.textContent = 'Failed to load tokens used. Please try again later'
    };
};

async function setVisualElementValue(t, jsonResp, element) {
    // Checks what line we are editing using the parameter "t". And then we modify it accordingly 
    if (t === "tkn") { // This could've been a switch statement, but we haven't learnt about those yet.
        element.textContent = `Earnings: ${jsonResp}`
        console.log('sent earnings')
    } else if (t === "ern"){
        element.textContent = `Tokens: ${jsonResp}`
        console.log('sent tokens')
    } else {
        // passed type is neither 'Token' nor 'Earnings' And as such must err
        throw new console.error('Type value "t" wasnt an expected value. This shouldn\'t be possible.' );
    };
}