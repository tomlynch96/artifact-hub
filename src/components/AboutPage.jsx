export default function AboutPage() {
    return (
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: 'clamp(48px, 8vw, 96px) clamp(24px, 4vw, 48px)'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '64px'
        }}>
          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 56px)',
            fontWeight: 'bold',
            marginBottom: '24px',
            color: '#1A1A1A'
          }}>
            About TeacherVibes
          </h1>
          <p style={{
            fontSize: 'clamp(18px, 3vw, 22px)',
            color: '#6B7280',
            lineHeight: '1.6',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Built by teachers, powered by AI
          </p>
        </div>
  
        {/* Mission Section */}
        <section style={{ marginBottom: '56px' }}>
          <h2 style={{
            fontSize: 'clamp(24px, 4vw, 32px)',
            fontWeight: 'bold',
            marginBottom: '20px',
            color: '#1A1A1A'
          }}>
            Our Mission
          </h2>
          <p style={{
            fontSize: '16px',
            lineHeight: '1.8',
            color: '#374151',
            marginBottom: '16px'
          }}>
            TeacherVibes is a community-driven platform where UK secondary and post-16 teachers share interactive teaching resources. We believe that the future of education lies in empowering teachers to harness AI tools to create engaging, curriculum-aligned learning experiences.
          </p>
          <p style={{
            fontSize: '16px',
            lineHeight: '1.8',
            color: '#374151'
          }}>
            Our platform serves as a comprehensive hub where teachers can discover, share and develop their practice to make best use of the many new tools at our disposal.
          </p>
        </section>
  
        {/* What We Do Section */}
        <section style={{ marginBottom: '56px' }}>
          <h2 style={{
            fontSize: 'clamp(24px, 4vw, 32px)',
            fontWeight: 'bold',
            marginBottom: '20px',
            color: '#1A1A1A'
          }}>
            What We Do
          </h2>
          <div style={{
            display: 'grid',
            gap: '24px'
          }}>
            <div style={{
              padding: '24px',
              background: '#F5F1E8',
              borderRadius: '12px',
              border: '1px solid #E8E1D0'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '12px',
                color: '#2C5F2D'
              }}>
                Curated Resource Library
              </h3>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.7',
                color: '#374151'
              }}>
                Browse and discover interactive teaching activities, simulations, and learning tools created by fellow educators using AI.
              </p>
            </div>
  
            <div style={{
              padding: '24px',
              background: '#F5F1E8',
              borderRadius: '12px',
              border: '1px solid #E8E1D0'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '12px',
                color: '#2C5F2D'
              }}>
                Curriculum Mapping
              </h3>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.7',
                color: '#374151'
              }}>
                All resources are tagged to subjects and keystages which along with the search function makes it easy to find exactly what you need for your lessons.
              </p>
            </div>
  
            <div style={{
              padding: '24px',
              background: '#F5F1E8',
              borderRadius: '12px',
              border: '1px solid #E8E1D0'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '12px',
                color: '#2C5F2D'
              }}>
                Community Curation
              </h3>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.7',
                color: '#374151'
              }}>
                Teachers vote on the most effective resources, ensuring quality content rises to the top and helping you discover what works in real classrooms.
              </p>
            </div>
          </div>
        </section>
  
        {/* Vision Section */}
        <section style={{ marginBottom: '56px' }}>
          <h2 style={{
            fontSize: 'clamp(24px, 4vw, 32px)',
            fontWeight: 'bold',
            marginBottom: '20px',
            color: '#1A1A1A'
          }}>
            Our Vision
          </h2>
          <p style={{
            fontSize: '16px',
            lineHeight: '1.8',
            color: '#374151',
            marginBottom: '16px'
          }}>
            We envision a future where every teacher has access to cutting-edge AI tools and a community of innovative educators pushing the boundaries of what's possible in education. TeacherVibes is more than just a resource library—it's a movement of teachers embracing technology to create more engaging, personalized, and effective learning experiences.
          </p>
          <p style={{
            fontSize: '16px',
            lineHeight: '1.8',
            color: '#374151'
          }}>
            As AI tools continue to evolve, we're committed to being at the forefront, helping teachers learn, adapt, and share best practices for integrating these powerful technologies into their teaching practice.
          </p>
        </section>
  
        {/* Get Involved Section */}
        <section style={{
          background: 'white',
          padding: '40px',
          borderRadius: '16px',
          border: '1px solid #E8E1D0',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: 'clamp(24px, 4vw, 32px)',
            fontWeight: 'bold',
            marginBottom: '16px',
            color: '#1A1A1A'
          }}>
            Join the Movement
          </h2>
          <p style={{
            fontSize: '16px',
            lineHeight: '1.7',
            color: '#6B7280',
            marginBottom: '28px',
            maxWidth: '500px',
            margin: '0 auto 28px'
          }}>
            Whether you're just getting started with AI tools or you're an experienced creator, there's a place for you in the TeacherVibes community.
          </p>
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <a
              href="https://teachervibes.substack.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '14px 32px',
                background: '#2C5F2D',
                color: 'white',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '600',
                textDecoration: 'none',
                display: 'inline-block',
                transition: 'all 0.2s',
                border: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#1A3A1B'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#2C5F2D'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              Read Our Blog
            </a>
          </div>
        </section>
  
        {/* Footer Note */}
        <div style={{
          marginTop: '64px',
          textAlign: 'center',
          padding: '32px',
          borderTop: '1px solid #E8E1D0'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#9CA3AF',
            lineHeight: '1.6'
          }}>
            Have questions or feedback? We'd love to hear from you.
          </p>
        </div>
      </div>
    )
  }