import { useState } from 'react';

const Tape = (props) => {
	console.log("sources", props.sources)
	return (
		<div>
			{ props.sources.map((source) => <audio 
				src={source.src} 
				type={source.mimeType} 
				ref={source.ref}
				onError={(e) => console.error('Audio element error', e.target.error)} 
				preload={'false'}
			></audio>) }
		</div>
	)
}

export default Tape;