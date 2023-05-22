export function buttonStyle(isHovering) {
	return {
		backgroundColor: isHovering ? 'black' : 'white',
		color: isHovering ? 'white' : 'black',
  		cursor: isHovering ? 'pointer' : 'arrow',
  		borderColor: 'black'
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