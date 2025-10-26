import React from 'react';
import { useParams } from 'react-router-dom';
import { styled } from 'styled-components';
import { useStaticPageQuery } from '../api/staticPage';

const Container = styled.div`
  max-width: 720px;
  margin: 40px auto;
  padding: 0 20px 60px 20px;
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

const Message = styled.div`
  padding: 24px;
  text-align: center;
  color: ${(props) => props.theme.colors?.textSecondary || '#666'};
`;

export const StaticPage: React.FC = () => {
  const { slug = '' } = useParams<{ slug: string }>();
  const { data, isLoading, isError } = useStaticPageQuery(slug);

  if (isLoading) {
    return (
      <Message>
        Loading page…
      </Message>
    );
  }

  if (isError || !data) {
    return (
      <Message>
        We could not find the page you requested.
      </Message>
    );
  }

  return (
    <Container>
      <Title>{data.title}</Title>
      {data.body.map((paragraph, index) => (
        <Paragraph key={index}>{paragraph}</Paragraph>
      ))}
    </Container>
  );
};
