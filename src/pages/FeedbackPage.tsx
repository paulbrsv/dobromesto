import React from 'react';
import { styled } from 'styled-components';

const Container = styled.div`
  max-width: 720px;
  margin: 40px auto;
  padding: 0 20px 60px 20px;
  color: ${(props) => props.theme.colors?.text || '#333'};
`;

const Title = styled.h2`
  font-size: 28px;
  margin-bottom: 16px;
`;

const Paragraph = styled.p`
  margin-bottom: 16px;
  line-height: 1.6;
  color: ${(props) => props.theme.colors?.textSecondary || '#555'};
`;

const List = styled.ul`
  margin: 16px 0 24px 20px;
  color: ${(props) => props.theme.colors?.textSecondary || '#555'};
  line-height: 1.5;
`;

const FeedbackForm = styled.form`
  display: grid;
  gap: 12px;
  margin-top: 24px;
`;

const Input = styled.input`
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 14px;
`;

const Textarea = styled.textarea`
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 14px;
  min-height: 140px;
  resize: vertical;
`;

const SubmitButton = styled.button`
  align-self: flex-start;
  background: ${(props) => props.theme.colors?.primary || '#333'};
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 10px 18px;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    background: ${(props) => props.theme.colors?.hover || '#555'};
  }
`;

export const FeedbackPage: React.FC = () => {
  return (
    <Container>
      <Title>Share your feedback</Title>
      <Paragraph>
        We are constantly updating Dobro Mesto together with the community. If you discovered a
        new cozy place or noticed that something changed, please let us know. Your feedback helps
        other people find the right spot faster.
      </Paragraph>
      <Paragraph>What can you send us:</Paragraph>
      <List>
        <li>Recommendations for new coffee shops, bakeries, or bars;</li>
        <li>Updated working hours or menu changes for existing places;</li>
        <li>Corrections for addresses, coordinates, or descriptions;</li>
        <li>Stories about your favourite spots that we should highlight.</li>
      </List>
      <Paragraph>
        Fill in the short form below or write to <a href="mailto:hello@dobromesto.rs">hello@dobromesto.rs</a>.
      </Paragraph>

      <FeedbackForm>
        <Input type="text" name="name" placeholder="Your name" required />
        <Input type="email" name="email" placeholder="Email" required />
        <Input type="text" name="place" placeholder="Place name" />
        <Textarea name="message" placeholder="Tell us why this place is special" />
        <SubmitButton type="submit">Send message</SubmitButton>
      </FeedbackForm>
    </Container>
  );
};
