/**
 * pathfinding
 * http://www.prelude-prod.fr
 *
 * @author Jean-François RENAULD
 * @version 1.0
 * Cette oeuvre est mise à disposition selon les termes de la Licence Creative Commons Paternité - Partage à l'Identique 3.0 non transcrit.
 * http://creativecommons.org/licenses/by-sa/3.0/deed.fr
 *
 * Si vous utilisez ce plugin, vous devez mettre un lien retour vers le site : http://www.prelude-prod.fr
 *
 * Date: Fri Apr 9 11:48:00 UTC 2013
 */

var mapLength, mapRowLength, gMinx, gMaxx, gMiny, gMaxy;

function astar(debx, deby, endx, endy, map, cutCorners, minx, maxx, miny, maxy) {
	var listOpen = [];
	var listClosed = [];
	var listPath = [];
	
	if(maxx == false) {
		gMaxx = map.length;
	} else {
		gMaxx = maxx;
	}
	if(minx == false) {
		gMinx = 0;
	} else {
		gMinx = minx;
	}

	if(maxy == false) {
		gMaxy = map[0].length;
	} else {
		gMaxy = maxy;
	}
	if(miny == false) {
		gMiny = 0;
	} else {
		gMiny = miny;
	}
	mapLength = gMaxx;
	mapRowLength = gMaxy;
	
	var nodeGoal = new Node(endx, endy, map, null, null);
	var nodeStart = new Node(debx, deby, map, null, nodeGoal);
	
	addNodeToList(nodeStart, listOpen);
	
	var n;
	while(!isListEmpty(listOpen)) {
		n = returnNodeWithLowestFScore(listOpen);
		addNodeToList(n, listClosed);
		removeNodeFromList(n, listOpen);
		if(areNodesEqual(n, nodeGoal)) {
			pathTo(n, listPath);
			listPath.reverse();
			return listPath;
		}
		n.makeChildNodes(map, cutCorners, nodeGoal);
		cullUnwantedNodes(n.childNodes, listOpen);
		cullUnwantedNodes(n.childNodes, listClosed);
		removeMatchingNodes(n.childNodes, listOpen);
		removeMatchingNodes(n.childNodes, listClosed);
		addListToList(n.childNodes, listOpen);
	}
	return null;
}

function pathTo(n, listPath) {
	listPath.push(new NodeCoordinate(n.row, n.col));
	if(n.parentNode == null) {
		return;
	}
	pathTo(n.parentNode, listPath);
}

function addListToList(listA, listB) {
	for(x in listA) {
		listB.push(listA[x]);
	}
}

function removeMatchingNodes(listToCheck, listToClean) {
	var listToCheckLength = listToCheck.length;
	var dummy = listToClean.length;
	for(var i = 0; i < listToCheckLength; i++) {
		for(var j = 0; j < dummy; j++) {
			if(listToClean[j].row == listToCheck[i].row && listToClean[j].col == listToCheck[i].col) {
				listToClean.splice(j, 1);
				dummy = listToClean.length;
			}
		}
	}
}

function cullUnwantedNodes(listToCull, listToCompare) {
	var listToCompareLength = listToCompare.length;
	var dummy = listToCull.length;
	for(var i = 0; i < listToCompareLength; i++) {
		for(var j = 0; j < dummy; j++) {
			if(listToCull[j].row == listToCompare[i].row && listToCull[j].col == listToCompare[i].col) {
				if(listToCull[j].f >= listToCompare[i].f) {
					listToCull.splice(j, 1);
					dummy = listToCull.length;
				}
			}
		}
	}
}

function areNodesEqual(nodeA, nodeB) {
	if (nodeA.row == nodeB.row && nodeA.col == nodeB.col) {
		return true;
	} else {
		return false;
	}
}

function returnNodeWithLowestFScore(list) {
	var lowestNode = list[0];
	for(x in list) {
		if(list[x].f < lowestNode.f) {
			lowestNode = list[x];
		} 
	}
	return lowestNode;
}

function isListEmpty(list) {
	return (list.length < 1) ? true : false;
}

function removeNodeFromList(node, list) {
	var listLength = list.length;
	for(var i = 0; i < listLength; i++) {
		if(node.row == list[i].row && node.col == list[i].col) {
			list.splice(i, 1);
			break;
		}
	}
}

function addNodeToList(node, list) {
	list.push(node);
}

function returnHScore(node, nodeGoal) {
	var y = node.row - nodeGoal.row;
	if(y < 0) {
		y = -y;
	}
	var x = node.col - nodeGoal.col;
	if(x < 0) {
		x = -x;
	}
	if(x > y) {
		return (y * 14) + 10 * (x - y);
	} else {
		return (x * 14) + 10 * (y - x);
	}
}

function NodeCoordinate(row, col) {
	this.row = row;
	this.col = col;
}

function Node(row, col, map, parentNode, nodeGoal) {
	this.row = row;
	this.col = col;
	if(row <= gMiny) {
		this.northAmbit = gMiny;
	} else {
		this.northAmbit = row - 1;
	}
	if(row >= gMaxy - 1) {
		this.southAmbit = gMaxy - 1;
	} else {
		this.southAmbit = row + 1;
	}
	if(col <= gMinx) {
		this.westAmbit = gMinx;
	} else {
		this.westAmbit = col - 1;
	}
	if(col >= gMaxx - 1) {
		this.eastAmbit = gMaxx - 1;
	} else {
		this.eastAmbit = col + 1;
	}
	this.parentNode = parentNode;
	this.childNodes = [];

	if(parentNode != null) {
		if(row == parentNode.row || col == parentNode.col) {
			this.g = parentNode.g + 10;
		} else {
			this.g = parentNode.g + 14;
		}
		this.h = returnHScore(this, nodeGoal);

	} else {
		this.g = 0;
		if (map[row][col] == 's') {
			this.h = returnHScore(this, nodeGoal);
		} else {
			this.h = 0;
		}
	}
	this.f = this.g + this.h;
	
	this.makeChildNodes = function(map, cutCorners, nodeGoal) {
		for(var i = this.northAmbit; i <= this.southAmbit; i++) {
			for(var j = this.westAmbit; j <= this.eastAmbit; j++) {
				if(i != this.row || j != this.col) {
					if(map[i][j] != '0') {
						if(cutCorners) {
							this.childNodes.push(new Node(i, j, map, this, nodeGoal));
						} else {
							if(i == this.row || j == this.col) {
								this.childNodes.push(new Node(i, j, map, this, nodeGoal));
							}
						}
					}
				}
			}
		}
	}
}