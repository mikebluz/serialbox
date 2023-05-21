export function buttonStyle(isHovering) {
	return {
		backgroundColor: isHovering ? 'yellow' : 'white',
		color: isHovering ? 'black' : 'black',
  		cursor: isHovering ? 'pointer' : 'arrow',
	}
}

export const headerFooterStyle = {
  backgroundColor: 'black',
  color: 'white',
};

export const componentDisplayStyle = { 
  display: 'flex',
  border: '1px solid black', 
  borderRadius: '6px',
  margin: '2px',
};

export function playerButtonStyle(isHovering) {
	return {
		backgroundColor: 'black',
		color: 'white',
  		cursor: isHovering ? 'pointer' : 'arrow',
	}
}