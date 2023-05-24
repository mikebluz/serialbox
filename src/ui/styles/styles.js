export const appStyle = {
	backgroundColor: 'black',
	color: 'white',
}

export function buttonStyle(isHovering) {
	return {
		backgroundColor: isHovering ? 'black' : '#2c97e8',
		color: isHovering ? 'white' : 'black',
  		cursor: isHovering ? 'pointer' : 'arrow',
  		borderColor: '#dde7f0',
  		margin: '2px'
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

export const songStyle = {
	'&:hover': {
		backgroundColor: 'yellow',
		cursor: 'pointer'
	}
};

export function playerButtonStyle(isHovering) {
	return {
		backgroundColor: 'black',
		color: 'white',
  		cursor: isHovering ? 'pointer' : 'arrow',
  		margin: '4px',
	}
}

export function progressButtonStyle(isHovering) {
	return {
		backgroundColor: 'black',
		color: 'white',
  		cursor: isHovering ? 'pointer' : 'arrow',
  		margin: '4px'
	}
}

export const buttonGroupStyle = {
	width: '90vw',
}