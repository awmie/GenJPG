import { h, render, Component, createRef } from 'preact';

interface ImageResponse {
	success: boolean;
	image_url?: string;
	error?: string;
}

interface State {
	loading: boolean;
	error: string | null;
	imageUrl: string | null;
}

class App extends Component<{}, State> {
	private promptInput = createRef<HTMLInputElement>();
	private readonly apiUrl = 'http://localhost:8000/generate-image';

	state = {
		loading: false,
		error: null,
		imageUrl: null
	};

	componentDidMount() {
		// Initialize theme
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		const savedTheme = localStorage.getItem('theme') || (prefersDark ? 'dark' : 'light');
		document.documentElement.setAttribute('data-theme', savedTheme);
	}

	toggleTheme = () => {
		const currentTheme = document.documentElement.getAttribute('data-theme');
		const newTheme = currentTheme === 'light' ? 'dark' : 'light';
		document.documentElement.setAttribute('data-theme', newTheme);
		localStorage.setItem('theme', newTheme);
	};

	handleSubmit = async (e: Event) => {
		e.preventDefault();
		const prompt = this.promptInput.current?.value.trim();
		
		if (!prompt) {
			this.setState({ error: 'Please enter a description for your image' });
			return;
		}

		try {
			this.setState({ loading: true, error: null });
			const response = await fetch(this.apiUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ prompt }),
			});

			const data: ImageResponse = await response.json();
			
			if (data.success && data.image_url) {
				this.setState({ imageUrl: data.image_url });
				if (this.promptInput.current) {
					this.promptInput.current.value = '';
				}
			} else {
				throw new Error(data.error || 'Failed to generate image');
			}
		} catch (error) {
			this.setState({ 
				error: error instanceof Error ? error.message : 'An error occurred'
			});
		} finally {
			this.setState({ loading: false });
		}
	};

	render() {
		const { loading, error, imageUrl } = this.state;

		return (
			<div>
				<button class="theme-toggle" onClick={this.toggleTheme} aria-label="Toggle theme">
					<div class="theme-toggle-inner">
						<i class="fas fa-sun sun-icon"></i>
						<i class="fas fa-moon moon-icon"></i>
					</div>
				</button>
				<div class="container">
					<h1>AI Image Generator</h1>
					<form class="input-group" onSubmit={this.handleSubmit}>
						<input
							type="text"
							ref={this.promptInput}
							placeholder="Describe something amazing..."
							autocomplete="off"
							disabled={loading}
						/>
						<button type="submit" disabled={loading}>
							<i class="fas fa-wand-magic-sparkles"></i>
							{loading ? 'Creating...' : 'Create Magic'}
						</button>
					</form>
					{loading && (
						<div class="loading">
							<div class="loading-icons">
								<i class="loading-icon fas fa-palette"></i>
								<i class="loading-icon fas fa-sparkles"></i>
								<i class="loading-icon fas fa-wand-magic"></i>
							</div>
							<div class="loading-text">
								Crafting your imagination...
							</div>
						</div>
					)}
					<div id="result">
						{error && (
							<div class="error">
								<i class="fas fa-exclamation-circle"></i> {error}
							</div>
						)}
						{imageUrl && <img src={imageUrl} alt="Generated image" />}
					</div>
				</div>
			</div>
		);
	}
}

render(<App />, document.body);