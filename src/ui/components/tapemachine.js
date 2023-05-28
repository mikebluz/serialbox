import { useState } from 'react';

const TapeMachine = (props) => {
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

export default TapeMachine;