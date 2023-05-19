export function buttonStyle(isHovering) {
	return {
		backgroundColor: isHovering ? 'white' : 'black',
		color: isHovering ? 'black' : 'white',
		border: '2px solid black',
		padding: '10px',
  		borderRadius: '4px',
  		cursor: isHovering ? 'pointer' : 'arrow',
  		// width: '20%',
  		// height: '5%',
  		margin: '5px'
	}
}