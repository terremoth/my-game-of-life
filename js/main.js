// @todo control speed
// @todo control population limir
// @todo border end (limit strict borders of table as the end)

var grid = $('#grid'); 

var getGridSize = () => $('#grid-size').val();
var getRows     = () => grid.children();
var getAllCells = () => getRows().children();

// Grid Controls
var generateRows = (numberOfRows) => grid.html("<tr></tr>".repeat(numberOfRows));
var generateColumns = (numberOfColumns) => getRows().append('<td></td>'.repeat(numberOfColumns));
var generateGrid = (desiredSize) => generateRows(desiredSize) && generateColumns(desiredSize);

// Game Engine

//var mirroring   = (index) => index > getGridSize() ? 1 : (index < 1 ? parseInt(getGridSize()) : index);
var mirroring   = function(index) {
    if (index > getGridSize()) {
        return 1; 
    } else if (index < 1 ) {
        return parseInt(getGridSize()); 
    } else {
        return index;
    }
};

var unmirroring = (index) => index;

var getLiveCellNeighbours = function(element) {
    
    var row    = element.parentNode.rowIndex+1;
    var column = element.cellIndex+1;
    
    var neighbours = [
        
        // Neighbours above
        `#grid>tr:nth-of-type(${mirroring(row - 1)})>td:nth-of-type(${mirroring(column - 1)}).live`,
        `#grid>tr:nth-of-type(${mirroring(row - 1)})>td:nth-of-type(${mirroring(column)}).live`,
        `#grid>tr:nth-of-type(${mirroring(row - 1)})>td:nth-of-type(${mirroring(column + 1)}).live`,
        
        // Neighbours on its side
        `#grid>tr:nth-of-type(${mirroring(row)})>td:nth-of-type(${mirroring(column - 1)}).live`,
        `#grid>tr:nth-of-type(${mirroring(row)})>td:nth-of-type(${mirroring(column + 1)}).live`,
        
        // Neighbours below
        `#grid>tr:nth-of-type(${mirroring(row + 1)})>td:nth-of-type(${mirroring(column - 1)}).live`,
        `#grid>tr:nth-of-type(${mirroring(row + 1)})>td:nth-of-type(${mirroring(column)}).live`,
        `#grid>tr:nth-of-type(${mirroring(row + 1)})>td:nth-of-type(${mirroring(column + 1)}).live`
    ];
    var group = neighbours.join(', ');
//    console.log(group);
    return document.querySelectorAll(group);
};


// Game Rules

// 1 - Any live cell with fewer than two live neighbours dies, as if by underpopulation.
var applyRule1 = async function(element) {
    if ($(element).hasClass('live')) {
        var liveNeighbours = await getLiveCellNeighbours(element);
        liveNeighbours.length < 2 ? $(element).addClass('willDie') : null;
    }
};

// 2 - Any live cell with two or three live neighbours lives on to the next generation.
var applyRule2 = async function(element) {
    if ($(element).hasClass('live')) {
        var liveNeighbours = await getLiveCellNeighbours(element);
        liveNeighbours.length === 2 || liveNeighbours.length === 3 ? $(element).addClass('willLive') : null;
    }
};

// 3 - Any live cell with more than three live neighbours dies, as if by overpopulation.
var applyRule3 = async function(element) {
    if ($(element).hasClass('live')) {
        var liveNeighbours = await getLiveCellNeighbours(element);
        liveNeighbours.length > 3 ? $(element).addClass('willDie') : null;
    }
};

// 4 - Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
var applyRule4 = async function(element) {
    if ($(element).not('.live')) {
        var liveNeighbours = await getLiveCellNeighbours(element);
        liveNeighbours.length === 3 ? $(element).addClass('willLive') : null;
    }
};

var updateFrame = function() {
    $('#grid .willDie').removeClass('live').removeClass('willDie');
    $('#grid .willLive').addClass('live').removeClass('willLive').removeClass('willDie');
};

// Helpers
var addGridClickEvents = () => $('#grid>tr>td').click((e) => $(e.target).toggleClass('live'));


//var proccessFrame = () => applyRule1() && applyRule2() && applyRule3() && applyRule4();
var proccessFrame = function() {
    getAllCells().each(function() {
        applyRule1(this);
        applyRule2(this);
        applyRule3(this);
        applyRule4(this);
        updateFrame();
    });
};

// Populate!
var running = false;
var startGame = () => {
    
    running = setInterval(function() {
        proccessFrame();
    },200);
};

var stopGame = () => clearInterval(running);

$(document).ready(function (){
    generateGrid(getGridSize());
    addGridClickEvents();
    
    // User Interaction Events
    $('.gen').click(() => generateGrid(getGridSize()) && addGridClickEvents());
    $('.start').click(startGame);
    $('.step').click(proccessFrame);
    $('.stop').click(stopGame);
    
});
