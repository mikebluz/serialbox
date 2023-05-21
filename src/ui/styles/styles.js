export function buttonStyle(isHovering) {
	return {
		backgroundColor: isHovering ? 'white' : 'black',
		color: isHovering ? 'black' : 'white',
  		cursor: isHovering ? 'pointer' : 'arrow',
	}
}