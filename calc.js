// TODO: Come up with better variable name for 'x'?
var x = '';
var canSize = { width: 750, height: 500 };

String.prototype.replaceAt = function(i, s)
{
    return this.substring(0, i) + s + this.substring(i + s.length);
};

String.prototype.insert = function(i, s)
{
    return this.substring(0, i) + s + this.substring(i);
};

String.prototype.replaceAll = function(old, replacement)
{
    var newStr = "";
    
    for(var i = 0; i < this.length; i++)
    {
        if(this[i] !== old)
            newStr += this[i];
        
        else
            newStr += replacement;
    }
    
    return newStr;
};

function isDigit(c)
{
    return !isNaN(c);
}

function isOp(op)
{
    switch (op)
    {
        case '^': return true;
        case '*': return true;
        case '/': return true;
        case '+': return true;
        case '-': return true;
        default:  return false;
    }
}

function isPar(pa)
{
    return pa === '(' || pa === ')';
}

function roundDouble(dub)
{
    return Math.floor((dub * 100) + 0.5) / 100;
}

function calcEq(eq)
{
    //console.log("PASSED IN: " + eq);
    var begIndex = 0;
    var eqs = [];
    var ops = [];
    var orderedOps = ["^", "*/", "+-"];

    // TODO: Condense spliting eq loop and calc loop into one
    // Split var around operations
    for (var i = 0; i < eq.length; i++)
    {
        if (eq[i] === '(')
        {
            for (var j = i, parenCount = 0; j < eq.length; j++)
            {
                i = j;

                if (eq[j] === '(')
                    parenCount++;

                else if (eq[j] === ')')
                    parenCount--;

                if (parenCount === 0)
                    break;
            }
        }

        else if (isOp(eq[i]) && i !== 0)
        {
            if(eq[i] === '-' && isOp(eq[i - 1]))
                continue;
            
            ops.push(eq[i]);
            var str = eq.substring(begIndex, i);
            
            if(str[str.length - 1] === ')')
            {
                if(str[0] === '-')
                    eqs.push(-1 * calcEq(str.substring(2, str.length - 1)));
                
                else
                    eqs.push(calcEq(str.substring(1, str.length - 1)));
            }
            
            else
                eqs.push(parseFloat(str));
            
            begIndex = i + 1;
        }
    }
    
    // Add the ending eq to the eq var array
    var str = eq.substring(begIndex, eq.length);
    
    if(str[str.length - 1] === ')')
    {
        if(str[0] === '-')
            eqs.push(-1 * calcEq(str.substring(2, str.length - 1)));

        else
            eqs.push(calcEq(str.substring(1, str.length - 1)));
    }
    
    else
        eqs.push(parseFloat(str));

    // Do the calculations to the numbers
    for (var i = 0; i < orderedOps.length; i++)
    {
        for (var j = 0; j < eqs.length - 1; j++)
        {
            if (orderedOps[i].indexOf(ops[j]) !== -1)
            {
                var val = eqs[j];
                
                switch (ops[j])
                {
                    case '-': val -= eqs[j + 1]; break;
                    case '+': val += eqs[j + 1]; break;
                    case '/': val /= eqs[j + 1]; break;
                    case '*': val *= eqs[j + 1]; break;
                    case '^': val = Math.pow(val, eqs[j + 1]); break;
                }

                ops.splice(j, 1);
                eqs.splice(j, 1);
                eqs[j] = val;
                j--;
            }
        }
    }

    return eqs[0];
}

function formatEq(eq)
{    
    eq = eq.replaceAll(" ", "");
    
    // Find variable 
    if(x === '')
    {
        for(var i = 0; i < eq.length; i++)
        {
            if(!isOp(eq[i]) && !isPar(eq[i]) && !isDigit(eq[i]) && eq[i] !== '.')
            {
                x = eq[i];
                break;
            }
        }
    }
    
    // Put * before and after ( ) to make parsing easier, replace 2 neg signs
    for (var i = 0; i < eq.length - 1; i++)
    {
        // Replace 2 negative signs with addition sign
        if(eq[i] === '-' && eq[i + 1] === '-')
            eq = eq.substring(0, i) + "+" + eq.substring(i + 2);
                
        else if(eq[i] === x && eq[i + 1] === x)
            eq = eq.insert(i + 1, "*");
        
        else if((isDigit(eq[i]) && eq[i + 1] === x) || (eq[i] === x && isDigit(eq[i + 1])))
            eq = eq.insert(i + 1, "*");
        
        else if ((isDigit(eq[i]) || eq[i] === x) && eq[i + 1] === '(')
            eq = eq.insert(i + 1, "*");

        else if ((isDigit(eq[i + 1]) || eq[i + 1] === x) && eq[i] === ')')
            eq = eq.insert(i + 1, "*");

        else if (eq[i] === ')' && eq[i + 1] === '(')
            eq = eq.insert(i + 1, "*");
    }

    // Put parenthesis around x^y 
    for (var i = 1, parenCount = 0, begIndex = 0, inParen = false; i < eq.length; i++)
    {
        if (eq[i] === '^')
        {
            eq = eq.insert(begIndex, "(");
            parenCount++;
            i++;
            begIndex = i + 1;
            inParen = eq[i + 1] === '(';
        }

        else if (isOp(eq[i]) && parenCount > 0 && !inParen)
        {
            if(eq[i] !== '-' || (i > 0 && eq[i] === '-' && !isOp(eq[i - 1]) && !eq[i - 1] === '('))
            {
                var parenth = "";

                for (var j = 0; j < parenCount; j++)
                    parenth += ")";

                eq = eq.insert(i, parenth);
                i += parenCount;
                begIndex = i + 1;
                parenCount = 0;
            }
        }

        else if (isOp(eq[i]) && (parenCount === 0 || inParen))
        {
            if(eq[i] !== '-' || (i > 0 && eq[i] === '-' && !isOp(eq[i - 1]) && !eq[i - 1] === '('))
                begIndex = i + 1;
        }

        else if (i === eq.length - 1 && parenCount > 0)
        {
            var parenth = "";

            for (var j = 0; j < parenCount; j++)
                parenth += ")";

            eq = eq + parenth;
            break;
        }
    }

    return eq;
}

// TODO: Implement drawing of the axes
function drawGraph(xMin, xMax, xScale, yMin, yMax, yScale, eq)
{
    var tick = { width: 2, length: 4 };
    var can = document.getElementById("calcCan").getContext("2d");
    var pixelWorth = { x: Math.abs(xMax - xMin) / canSize.width, y: Math.abs(yMax - yMin) / canSize.height };
    var prevOut = true;
    
    // Draw equation
    can.beginPath();
    
    for(var xCord = 0, xVal = xMin; xCord < canSize.width; xCord++)
    {
        var yVal = calcEq(eq.replaceAll(x, "(" + xVal + ")"));
        var yCord = -(yVal / pixelWorth.y) + (canSize.height / 2) + (((yMax + yMin) / pixelWorth.y) / 2);

        if(prevOut)
            can.moveTo(xCord, yCord);

        prevOut = yCord > canSize.height || yCord < 0;
        can.lineTo(xCord, yCord);
        xVal = roundDouble(xVal + pixelWorth.x);
    }
    
    can.stroke();
    can.closePath();
}

function init()
{
    var can = document.getElementById("calcCan");
    can.width = canSize.width;
    can.height = canSize.height;
    can.style.width = can.width + "px";
    can.style.height = can.height + "px";
}

// TODO: Add support for trig functions
function main()
{
    // TODO: Deal with incorrect input
//    try
//    {
        var eq = formatEq(document.getElementById("eqInput").value);
        var xMin = parseFloat(document.getElementById("xMinInput").value);
        var xMax = parseFloat(document.getElementById("xMaxInput").value);
        var xScale = parseFloat(document.getElementById("xScaleInput").value);
        var yMin = parseFloat(document.getElementById("yMinInput").value);
        var yMax = parseFloat(document.getElementById("yMaxInput").value);
        var yScale = parseFloat(document.getElementById("yScaleInput").value);
        
        drawGraph(xMin, xMax, xScale, yMin, yMax, yScale, eq);
        console.log("Eq: " + eq);
        console.log("Re: " + calcEq(eq));
//    }
//    
//    catch(e)
//    {
//        alert("Invalid Input!");
//    }
}

window.onload = init;